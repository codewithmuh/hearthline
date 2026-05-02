"""OpenAI tool-calling loop — mirrors the Anthropic loop in receptionist.py.

The OpenAI Chat Completions API returns tool calls in `message.tool_calls`
with a different shape from Anthropic's `tool_use` blocks. We translate the
shared TOOLS schema (Anthropic format) into OpenAI's function-tool format on
the fly so the dispatch layer stays provider-agnostic.
"""
from __future__ import annotations

import json
import logging
from typing import Any

logger = logging.getLogger(__name__)

OPENAI_MODEL = "gpt-4o"


def _tools_for_openai(tools: list[dict]) -> list[dict]:
    out = []
    for t in tools:
        out.append({
            "type": "function",
            "function": {
                "name": t["name"],
                "description": t.get("description", ""),
                "parameters": t.get("input_schema", {"type": "object", "properties": {}}),
            },
        })
    return out


def _claude_to_openai(messages: list[dict]) -> list[dict]:
    """Convert Claude-style turns to OpenAI chat.completions format.

    Claude messages look like {role, content: str | list[blocks]} where blocks
    can be text / tool_use / tool_result. OpenAI wants:
      - assistant text         → {role: "assistant", content: "..."}
      - assistant tool_use     → {role: "assistant", tool_calls: [...]}
      - tool_result            → {role: "tool", tool_call_id, content}
    """
    out: list[dict] = []
    for m in messages:
        role = m.get("role")
        content = m.get("content")
        if isinstance(content, str):
            out.append({"role": role, "content": content})
            continue
        if not isinstance(content, list):
            continue
        if role == "assistant":
            text_parts: list[str] = []
            tool_calls: list[dict] = []
            for block in content:
                btype = block.get("type")
                if btype == "text":
                    text_parts.append(block.get("text", ""))
                elif btype == "tool_use":
                    tool_calls.append({
                        "id": block.get("id"),
                        "type": "function",
                        "function": {
                            "name": block.get("name"),
                            "arguments": json.dumps(block.get("input") or {}),
                        },
                    })
            msg: dict[str, Any] = {"role": "assistant"}
            if text_parts:
                msg["content"] = "\n".join(text_parts)
            else:
                msg["content"] = None
            if tool_calls:
                msg["tool_calls"] = tool_calls
            out.append(msg)
        elif role == "user":
            for block in content:
                if block.get("type") == "tool_result":
                    out.append({
                        "role": "tool",
                        "tool_call_id": block.get("tool_use_id"),
                        "content": block.get("content") if isinstance(block.get("content"), str)
                        else json.dumps(block.get("content"), default=str),
                    })
                elif block.get("type") == "text":
                    out.append({"role": "user", "content": block.get("text", "")})
    return out


def run_openai_loop(
    client,
    *,
    system_prompt: str,
    tools: list[dict],
    conversation_history: list[dict],
    execute_tool,
) -> dict[str, Any]:
    """Run the OpenAI agentic loop. Mirrors handle_conversation_turn in receptionist.py."""
    oa_tools = _tools_for_openai(tools)
    oa_messages = [{"role": "system", "content": system_prompt}, *_claude_to_openai(conversation_history)]

    should_end = False
    last_tool: str | None = None

    while True:
        resp = client.chat.completions.create(
            model=OPENAI_MODEL,
            max_tokens=1024,
            tools=oa_tools,
            messages=oa_messages,
        )
        choice = resp.choices[0]
        msg = choice.message
        if not msg.tool_calls:
            return {"text": (msg.content or "").strip(), "end_call": should_end}

        # Append the assistant's tool-call message so the model has context for the result.
        oa_messages.append({
            "role": "assistant",
            "content": msg.content,
            "tool_calls": [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {"name": tc.function.name, "arguments": tc.function.arguments},
                }
                for tc in msg.tool_calls
            ],
        })

        for tc in msg.tool_calls:
            name = tc.function.name
            try:
                tool_input = json.loads(tc.function.arguments or "{}")
            except json.JSONDecodeError:
                tool_input = {}

            if name == "end_call":
                logger.info("[END_CALL] reason=%s", tool_input.get("reason", "unknown"))
                should_end = True
                oa_messages.append({"role": "tool", "tool_call_id": tc.id, "content": "{}"})
                continue

            last_tool = name
            logger.info("[TOOL] %s %s", name, json.dumps(tool_input))
            try:
                result = execute_tool(name, tool_input)
            except Exception as exc:  # noqa: BLE001
                logger.error("[TOOL ERROR] %s: %s", name, exc)
                result = {"error": str(exc)}
            logger.info("[RESULT] %s", json.dumps(result, default=str))
            oa_messages.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": json.dumps(result, default=str),
            })

        if should_end:
            # Surface a closing line.
            if last_tool in ("book_appointment", "send_sms"):
                return {"text": "You're all set! Anything else I can help with?", "end_call": True}
            return {"text": "", "end_call": True}
