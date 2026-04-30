"""Anna — agentic loop. Claude calls tools until done, returns final spoken text."""
from __future__ import annotations

import json
import logging
from typing import Any

from django.conf import settings

from apps.calls.services.persistence import book_appointment_tool, qualify_lead_tool
from apps.calls.services.scheduling import check_availability
from apps.calls.services.sms import send_sms
from apps.core.models import Business

from .prompts import get_receptionist_prompt
from .tools import TOOLS

logger = logging.getLogger(__name__)

CLAUDE_MODEL = "claude-sonnet-4-6"


def _client():
    if not settings.ANTHROPIC_API_KEY:
        return None
    try:
        import anthropic  # noqa: WPS433
        return anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    except ImportError:
        logger.warning("anthropic SDK not installed")
        return None


def _resolve_business():
    biz = Business.objects.first()
    if not biz:
        return None
    return biz


def execute_tool(name: str, tool_input: dict) -> dict:
    """Dispatch a tool call to its implementation."""
    if name == "qualify_lead":
        return qualify_lead_tool(tool_input)
    if name == "book_appointment":
        return book_appointment_tool(tool_input)
    if name == "check_availability":
        return check_availability(tool_input["date"], tool_input.get("trade"))
    if name == "send_sms":
        return send_sms(tool_input["to"], tool_input["message"])
    return {"error": f"Unknown tool: {name}"}


def handle_conversation_turn(conversation_history: list, caller_phone: str | None = None) -> dict[str, Any]:
    """Run the agentic loop for one Vapi turn. Returns {text, end_call}."""
    biz = _resolve_business()
    biz_name = biz.name if biz else "Hearthline"
    trade = biz.trade if biz else "general"
    kb = biz.knowledge_base if biz else ""
    tz = biz.timezone if biz else "America/Los_Angeles"

    system_prompt = get_receptionist_prompt(
        business_name=biz_name, trade=trade, knowledge_base=kb, timezone=tz,
    )
    if caller_phone:
        system_prompt += (
            f"\n\nCALLER INFO:\n- Caller's phone is {caller_phone}. Use it as the default "
            f"contact unless they ask you to use a different number."
        )

    client = _client()
    if not client:
        # Stub — useful for local dev without API keys
        return {
            "text": "Anna here. I'd love to help, but my AI brain isn't connected right now. Please call back in a moment.",
            "end_call": False,
        }

    response = client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=1024,
        system=system_prompt,
        tools=TOOLS,
        messages=conversation_history,
    )

    should_end = False
    last_tool: str | None = None
    last_result: dict | None = None

    while response.stop_reason == "tool_use":
        tool_block = next((b for b in response.content if b.type == "tool_use"), None)
        if not tool_block:
            break

        if tool_block.name == "end_call":
            logger.info("[END_CALL] reason=%s", tool_block.input.get("reason", "unknown"))
            should_end = True
            break

        last_tool = tool_block.name
        logger.info("[TOOL] %s %s", tool_block.name, json.dumps(tool_block.input))
        try:
            last_result = execute_tool(tool_block.name, tool_block.input)
        except Exception as exc:  # noqa: BLE001
            logger.error("[TOOL ERROR] %s: %s", tool_block.name, exc)
            last_result = {"error": str(exc)}
        logger.info("[RESULT] %s", json.dumps(last_result, default=str))

        conversation_history.append(
            {"role": "assistant", "content": response.to_dict()["content"]},
        )
        conversation_history.append({
            "role": "user",
            "content": [{
                "type": "tool_result",
                "tool_use_id": tool_block.id,
                "content": json.dumps(last_result, default=str),
            }],
        })

        response = client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=1024,
            system=system_prompt,
            tools=TOOLS,
            messages=conversation_history,
        )

    text_block = next((b for b in response.content if b.type == "text"), None)
    response_text = (text_block.text.strip() if text_block else "")

    if not response_text and last_tool:
        if last_tool in ("book_appointment", "send_sms"):
            response_text = "You're all set! Anything else I can help with?"
        else:
            response_text = "Is there anything else I can help you with?"

    return {"text": response_text, "end_call": should_end}
