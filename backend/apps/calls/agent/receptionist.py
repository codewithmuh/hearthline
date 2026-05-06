"""Anna — agentic loop. Claude calls tools until done, returns final spoken text."""
from __future__ import annotations

import json
import logging
from typing import Any

from django.conf import settings
from django.core.cache import cache

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

# Per-call state TTLs — longer than any realistic call.
_CALL_STATE_TTL = 60 * 60  # 1 hour


def _sms_already_sent(call_id: str | None, to: str) -> dict | None:
    """Returns the cached send result if we've already sent an SMS on this call.

    Vapi re-runs the agent loop every turn but doesn't replay tool history, so
    Claude has no memory that send_sms already fired and will re-call it with
    a freshly-paraphrased body. We cap outbound SMS at one per (call_id, to)
    so the customer doesn't get the same confirmation 3 times.
    """
    if not call_id or not to:
        return None
    return cache.get(f"sms_sent:{call_id}:{to}")


def _mark_sms_sent(call_id: str | None, to: str, result: dict) -> None:
    if not call_id or not to:
        return
    cache.set(f"sms_sent:{call_id}:{to}", result, timeout=_CALL_STATE_TTL)


def _end_call_already_deferred(call_id: str | None) -> bool:
    """Was end_call already deferred once for this call? If so, the *next*
    end_call should fire for real instead of looping forever."""
    if not call_id:
        return False
    return bool(cache.get(f"end_deferred:{call_id}"))


def _mark_end_call_deferred(call_id: str | None) -> None:
    if not call_id:
        return
    cache.set(f"end_deferred:{call_id}", True, timeout=_CALL_STATE_TTL)


# Tools whose results are stable for a given call — re-running them is wasteful
# and adds 1–3s of LLM + DB latency per turn. We cache the first result for
# the call lifetime and return it on subsequent calls.
_DEDUPABLE_TOOLS = {"qualify_lead", "draft_quote", "book_appointment", "check_availability"}


def _tool_cache_get(call_id: str | None, tool: str) -> dict | None:
    if not call_id or tool not in _DEDUPABLE_TOOLS:
        return None
    return cache.get(f"tool_done:{call_id}:{tool}")


def _tool_cache_set(call_id: str | None, tool: str, result: dict) -> None:
    if not call_id or tool not in _DEDUPABLE_TOOLS:
        return
    cache.set(f"tool_done:{call_id}:{tool}", result, timeout=_CALL_STATE_TTL)


def _tools_already_run(call_id: str | None) -> list[str]:
    """Names of tools that have already been called (cached result exists)
    on this call_id — used to nudge the model not to re-fire them."""
    if not call_id:
        return []
    done: list[str] = []
    for tool in sorted(_DEDUPABLE_TOOLS):
        if cache.get(f"tool_done:{call_id}:{tool}") is not None:
            done.append(tool)
    if cache.get(f"sms_sent:{call_id}:*"):
        done.append("send_sms")
    # send_sms is keyed per-recipient, scan a couple of common recipient keys.
    return done


def _client(business=None):
    biz_key = (business.resolved_anthropic_key if business else "")
    env_key = settings.ANTHROPIC_API_KEY
    key = biz_key or env_key
    logger.info(
        "[KEY] biz=%s biz_key_len=%d env_key_len=%d total_businesses=%d",
        getattr(business, "id", None),
        len(biz_key or ""),
        len(env_key or ""),
        Business.objects.count(),
    )
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


_BIZ_CACHE: dict[str, tuple[float, Business]] = {}
_BIZ_CACHE_TTL = 60 * 30  # 30 min — covers the longest realistic call


def _resolve_business(call_id: str | None = None):
    """Pick the business that owns this call. Cached per call_id.

    Without a call_id (test-call dashboard, manual invocation) we still query.
    With one, the lookup is a single dict hit after the first turn.
    """
    import time
    if call_id and call_id in _BIZ_CACHE:
        ts, biz = _BIZ_CACHE[call_id]
        if time.time() - ts < _BIZ_CACHE_TTL:
            return biz
        _BIZ_CACHE.pop(call_id, None)

    biz = None
    for candidate in Business.objects.all().order_by("id"):
        if (candidate.anthropic_api_key or "").strip():
            biz = candidate
            break
    if biz is None:
        biz = Business.objects.order_by("id").first()

    if call_id and biz is not None:
        if len(_BIZ_CACHE) > 1024:
            _BIZ_CACHE.clear()
        _BIZ_CACHE[call_id] = (time.time(), biz)
    return biz


def forget_call(call_id: str | None) -> None:
    """Drop the cached business for a finished call. Call from the Vapi end-of-call hook."""
    if call_id:
        _BIZ_CACHE.pop(call_id, None)


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
    cached = _tool_cache_get(call_id, name)
    if cached is not None:
        logger.info("[TOOL DEDUP] returning cached %s for call_id=%s", name, call_id)
        return {**cached, "deduped": True}

    if name == "qualify_lead":
        result = qualify_lead_tool(tool_input, verified_phone=caller_phone, call_id=call_id)
        _tool_cache_set(call_id, name, result)
        return result
    if name == "book_appointment":
        result = book_appointment_tool(tool_input, verified_phone=caller_phone, call_id=call_id)
        _tool_cache_set(call_id, name, result)
        return result
    if name == "draft_quote":
        result = draft_quote_tool(tool_input, verified_phone=caller_phone, call_id=call_id)
        _tool_cache_set(call_id, name, result)
        return result
    if name == "check_availability":
        result = check_availability(tool_input["date"], tool_input.get("trade"))
        _tool_cache_set(call_id, name, result)
        return result
    if name == "send_sms":
        to = (tool_input.get("to") or "").strip() or (caller_phone or "")
        cached = _sms_already_sent(call_id, to)
        if cached is not None:
            logger.info("[SMS DEDUP] suppressing repeat send_sms call_id=%s to=%s", call_id, to)
            return {**cached, "deduped": True}
        result = send_sms(to, tool_input["message"], business=business)
        if result.get("ok"):
            _mark_sms_sent(call_id, to, result)
        return result
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
    except Exception as exc:  # noqa: BLE001 — best-effort timeline persistence; never crash the live call on a DB hiccup
        logger.warning("[TRANSCRIPT PERSIST] %s", exc)


def _user_turn_count(history: list) -> int:
    """Count caller turns in the running conversation (skips tool_result blocks)."""
    return sum(
        1 for m in history
        if m.get("role") == "user"
        and isinstance(m.get("content"), str)
        and (m.get("content") or "").strip()
    )


def handle_conversation_turn(conversation_history: list, caller_phone: str | None = None,
                              call_id: str | None = None) -> dict[str, Any]:
    """Run the agentic loop for one Vapi turn. Returns {text, end_call}."""
    _log_transcript(conversation_history, caller_phone, call_id)

    if not (caller_phone or "").strip() and _user_turn_count(conversation_history) >= 2:
        logger.warning(
            "[NO CALLER PHONE] call_id=%s — Vapi did not send customer.number after 2 turns",
            call_id,
        )

    biz = _resolve_business(call_id=call_id)
    biz_name = biz.name if biz else "Hearthline"
    trade = biz.trade if biz else "general"
    kb = biz.knowledge_base if biz else ""
    tz = biz.timezone if biz else "America/Los_Angeles"
    persona = (getattr(biz, "voice_persona", "") or "Anna").strip() or "Anna"
    currency = (getattr(biz, "currency", "") or "USD").upper()

    system_prompt = get_receptionist_prompt(
        business_name=biz_name, trade=trade, knowledge_base=kb, timezone=tz,
        currency=currency,
        persona_name=persona,
    )
    if caller_phone:
        system_prompt += (
            f"\n\nCALLER INFO:\n- Caller's phone is {caller_phone}. Use it as the default "
            f"contact unless they ask you to use a different number."
        )
    else:
        system_prompt += (
            "\n\nCALLER INFO:\n- Caller ID is not available for this call. Ask the caller "
            "for their phone number early, before calling qualify_lead or book_appointment, "
            "and pass it as customer_phone."
        )

    already_run = _tools_already_run(call_id)
    if already_run:
        system_prompt += (
            "\n\nTOOLS ALREADY CALLED THIS CALL:\n- "
            + "\n- ".join(already_run)
            + "\nDo NOT call any of these tools again. Their results are already "
            "saved. Speak to the caller directly instead."
        )

    provider = (getattr(biz, "llm_provider", "") or "anthropic").lower()

    if provider == "openai":
        oai = _openai_client(biz)
        if not oai:
            return {
                "text": f"{persona} here. I'd love to help, but my AI brain isn't connected right now. Please call back in a moment.",
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
        # Defer hangup once so Vapi can play the closing line — but only the
        # FIRST time. If we've already deferred this call, fire end_call for
        # real even if Claude tries to add more text.
        if result.get("end_call"):
            if _end_call_already_deferred(call_id):
                logger.info("[END_CALL] firing — already deferred once, hanging up now")
                result["end_call"] = True
            elif len(result.get("text") or "") > 12:
                logger.info("[END_CALL DEFERRED] hangup deferred so Vapi can play closing message")
                _mark_end_call_deferred(call_id)
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
            "text": f"{persona} here. I'd love to help, but my AI brain isn't connected right now. Please call back in a moment.",
            "end_call": False,
        }

    response = client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=320,
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
            except Exception as exc:  # noqa: BLE001 — surface any tool failure back to the LLM as a tool_result so it can recover, not 500
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
            max_tokens=320,
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
    # Next turn, the model fires end_call alone with empty text → real hangup.
    # BUT defer only once per call — if we've already deferred this call_id,
    # honor the second end_call regardless of text length so we don't loop.
    if should_end:
        if _end_call_already_deferred(call_id):
            logger.info("[END_CALL] firing — already deferred once, hanging up now")
        elif len(response_text) > 12:
            logger.info("[END_CALL DEFERRED] hangup deferred so Vapi can play closing message")
            _mark_end_call_deferred(call_id)
            should_end = False

    logger.info("[CALL %s · %s] ANNA: %s%s",
                call_id or "?", caller_phone or "?",
                response_text[:300], " [HANGUP]" if should_end else "")
    _persist_turn(conversation_history, caller_phone, call_id, response_text)
    return {"text": response_text, "end_call": should_end}
