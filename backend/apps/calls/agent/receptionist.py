"""Anna — agentic loop. Claude calls tools until done, returns final spoken text."""
from __future__ import annotations

import json
import logging
from typing import Any

from django.conf import settings

from apps.calls.services.email import send_email
from apps.calls.services.persistence import book_appointment_tool, draft_quote_tool, qualify_lead_tool
from apps.calls.services.scheduling import check_availability
from apps.calls.services.sms import send_sms
from apps.core.models import Business

from .openai_loop import run_openai_loop
from .prompts import get_receptionist_prompt
from .tools import TOOLS

logger = logging.getLogger(__name__)

CLAUDE_MODEL = "claude-sonnet-4-6"


def _client(business=None):
    key = (business.resolved_anthropic_key if business else "") or settings.ANTHROPIC_API_KEY
    if not key:
        return None
    try:
        import anthropic  # noqa: WPS433
        return anthropic.Anthropic(api_key=key)
    except ImportError:
        logger.warning("anthropic SDK not installed")
        return None


def _openai_client(business=None):
    key = (business.resolved_openai_key if business else "") or settings.OPENAI_API_KEY
    if not key:
        return None
    try:
        import openai  # noqa: WPS433
        return openai.OpenAI(api_key=key)
    except ImportError:
        logger.warning("openai SDK not installed")
        return None


def _resolve_business():
    biz = Business.objects.first()
    if not biz:
        return None
    return biz


def execute_tool(name: str, tool_input: dict, *, caller_phone: str | None = None,
                 call_id: str | None = None, business=None) -> dict:
    """Dispatch a tool call to its implementation.

    `caller_phone` is the verified Vapi caller ID — used as the canonical phone
    for any persistence write so a hallucinated `customer_phone` from the LLM
    can't overwrite the real number.

    `call_id` is Vapi's unique call identifier — used as a dedup key so
    repeated tool calls within one phone call land on the same Lead row.

    `business` is the resolved Business — its dashboard-saved Twilio creds
    take priority over env-var fallbacks for outbound SMS.
    """
    if name == "qualify_lead":
        return qualify_lead_tool(tool_input, verified_phone=caller_phone, call_id=call_id)
    if name == "book_appointment":
        return book_appointment_tool(tool_input, verified_phone=caller_phone, call_id=call_id)
    if name == "draft_quote":
        return draft_quote_tool(tool_input, verified_phone=caller_phone, call_id=call_id)
    if name == "check_availability":
        return check_availability(tool_input["date"], tool_input.get("trade"))
    if name == "send_sms":
        to = (tool_input.get("to") or "").strip() or (caller_phone or "")
        return send_sms(to, tool_input["message"], business=business)
    if name == "send_email":
        to = (tool_input.get("to") or "").strip()
        return send_email(to, tool_input.get("subject", ""), tool_input.get("body", ""), business=business)
    return {"error": f"Unknown tool: {name}"}


def _log_transcript(history: list, caller_phone: str | None, call_id: str | None) -> None:
    """Print the running call transcript to the backend log so docker logs shows it live."""
    last_user = next(
        (m for m in reversed(history)
         if m.get("role") == "user" and isinstance(m.get("content"), str) and m["content"].strip()),
        None,
    )
    if last_user:
        text = last_user["content"][:300]
        logger.info("[CALL %s · %s] CALLER: %s", call_id or "?", caller_phone or "?", text)


def _persist_turn(conversation_history: list, caller_phone: str | None,
                   call_id: str | None, anna_reply: str) -> None:
    """Save the latest user turn + Anna's reply to the Lead's Conversation timeline.

    Best-effort — never crashes the agent if the lookup fails. Looks for a Lead
    already opened for this call (by vapi_call_id) and appends Messages to it.
    """
    if not call_id:
        return
    try:
        from apps.leads.models import Conversation, Lead, Message
        lead = Lead.objects.filter(extracted_fields__vapi_call_id=call_id).order_by("-created_at").first()
        if not lead:
            return
        convo = lead.conversations.order_by("-started_at").first()
        if not convo:
            convo = Conversation.objects.create(lead=lead)
        last_user = next(
            (m for m in reversed(conversation_history)
             if m.get("role") == "user" and isinstance(m.get("content"), str) and m["content"].strip()),
            None,
        )
        if last_user:
            Message.objects.create(
                conversation=convo, direction="in", role="user",
                body=last_user["content"][:2000],
            )
        if anna_reply:
            Message.objects.create(
                conversation=convo, direction="out", role="assistant",
                body=anna_reply[:2000],
            )
    except Exception as exc:  # noqa: BLE001
        logger.warning("[TRANSCRIPT PERSIST] %s", exc)


def handle_conversation_turn(conversation_history: list, caller_phone: str | None = None,
                              call_id: str | None = None) -> dict[str, Any]:
    """Run the agentic loop for one Vapi turn. Returns {text, end_call}."""
    _log_transcript(conversation_history, caller_phone, call_id)
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

    provider = (getattr(biz, "llm_provider", "") or "anthropic").lower()

    if provider == "openai":
        oai = _openai_client(biz)
        if not oai:
            return {
                "text": "Anna here. I'd love to help, but my AI brain isn't connected right now. Please call back in a moment.",
                "end_call": False,
            }
        def dispatch(name: str, tool_input: dict) -> dict:
            return execute_tool(name, tool_input, caller_phone=caller_phone, call_id=call_id, business=biz)

        result = run_openai_loop(
            oai,
            system_prompt=system_prompt,
            tools=TOOLS,
            conversation_history=conversation_history,
            execute_tool=dispatch,
        )
        # Same defer-hangup safety net as the Claude branch.
        if result.get("end_call") and len(result.get("text") or "") > 12:
            logger.info("[END_CALL DEFERRED] hangup deferred so Vapi can play closing message")
            result["end_call"] = False
        logger.info("[CALL %s · %s] ANNA: %s%s",
                    call_id or "?", caller_phone or "?",
                    (result.get("text") or "")[:300],
                    " [HANGUP]" if result.get("end_call") else "")
        _persist_turn(conversation_history, caller_phone, call_id, result.get("text") or "")
        return result

    client = _client(biz)
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
        tool_blocks = [b for b in response.content if b.type == "tool_use"]
        if not tool_blocks:
            break

        tool_results: list[dict] = []
        end_call_requested = False
        for tb in tool_blocks:
            if tb.name == "end_call":
                logger.info("[END_CALL] reason=%s", tb.input.get("reason", "unknown"))
                end_call_requested = True
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": tb.id,
                    "content": json.dumps({"ok": True}),
                })
                continue

            last_tool = tb.name
            logger.info("[TOOL] %s %s", tb.name, json.dumps(tb.input))
            try:
                last_result = execute_tool(tb.name, tb.input, caller_phone=caller_phone, call_id=call_id, business=biz)
            except Exception as exc:  # noqa: BLE001
                logger.error("[TOOL ERROR] %s: %s", tb.name, exc)
                last_result = {"error": str(exc)}
            logger.info("[RESULT] %s", json.dumps(last_result, default=str))
            tool_results.append({
                "type": "tool_result",
                "tool_use_id": tb.id,
                "content": json.dumps(last_result, default=str),
            })

        conversation_history.append(
            {"role": "assistant", "content": response.to_dict()["content"]},
        )
        conversation_history.append({"role": "user", "content": tool_results})

        if end_call_requested:
            should_end = True
            break

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

    # Safety net: if Anna fired end_call WITH a non-trivial closing message in
    # the same turn, defer the hangup so Vapi finishes playing the audio first.
    # Next turn, the model will fire end_call alone with empty text → real hangup.
    if should_end and len(response_text) > 12:
        logger.info("[END_CALL DEFERRED] hangup deferred so Vapi can play closing message")
        should_end = False

    logger.info("[CALL %s · %s] ANNA: %s%s",
                call_id or "?", caller_phone or "?",
                response_text[:300], " [HANGUP]" if should_end else "")
    _persist_turn(conversation_history, caller_phone, call_id, response_text)
    return {"text": response_text, "end_call": should_end}
