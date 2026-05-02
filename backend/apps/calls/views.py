"""Vapi + Twilio webhook handlers + custom-LLM chat completions endpoint."""
from __future__ import annotations

import hmac
import json
import logging
import time
import uuid

from django.conf import settings
from django.http import JsonResponse, StreamingHttpResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.calls.agent.receptionist import handle_conversation_turn
from apps.core.models import Business

from .models import Call
from .serializers import CallSerializer

logger = logging.getLogger(__name__)


def _verify_vapi_signature(request) -> bool:
    """Vapi posts a shared secret in the `x-vapi-secret` header.

    Returns True if VAPI_WEBHOOK_SECRET is unset (dev) OR the header matches.
    Returns False only when a secret is configured AND the header is wrong.
    """
    expected = (settings.VAPI_WEBHOOK_SECRET or "").strip()
    if not expected:
        return True  # not configured — accept (dev mode)
    received = request.headers.get("X-Vapi-Secret", "") or request.headers.get("X-Vapi-Signature", "")
    return hmac.compare_digest(expected, received)


def _verify_twilio_signature(request) -> bool:
    """Twilio posts an HMAC-SHA1 of the URL+body in `X-Twilio-Signature`.

    Verifies via the official twilio.request_validator helper. Skipped when
    TWILIO_AUTH_TOKEN is unset.
    """
    token = (settings.TWILIO_AUTH_TOKEN or "").strip()
    if not token:
        return True
    try:
        from twilio.request_validator import RequestValidator
    except ImportError:
        logger.warning("twilio package missing — skipping signature check")
        return True
    validator = RequestValidator(token)
    signature = request.headers.get("X-Twilio-Signature", "")
    url = request.build_absolute_uri()
    params = request.POST.dict() if request.method == "POST" else {}
    return validator.validate(url, params, signature)


def _verify_chat_completions_secret(request) -> bool:
    """Vapi's custom-LLM endpoint shares the same VAPI_WEBHOOK_SECRET.

    Public-facing endpoint — anyone can hit it without auth, so the shared
    secret is the only thing keeping a stranger from spending the tenant's
    Anthropic credits. In dev (no secret set) we accept everything.
    """
    expected = (settings.VAPI_WEBHOOK_SECRET or "").strip()
    if not expected:
        return True
    # Vapi sends it as a Bearer token on the custom-LLM endpoint.
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        received = auth[7:].strip()
    else:
        received = request.headers.get("X-Vapi-Secret", "")
    return hmac.compare_digest(expected, received)


class CallList(generics.ListAPIView):
    queryset = Call.objects.all().order_by("-started_at")
    serializer_class = CallSerializer
    permission_classes = [IsAuthenticated]


def _openai_to_claude(messages: list) -> list:
    """Convert OpenAI-format messages to Claude-format messages, dropping system."""
    out: list[dict] = []
    for m in messages:
        role = m.get("role", "")
        content = m.get("content", "")
        if role == "system":
            continue
        if role == "assistant":
            out.append({"role": "assistant", "content": content or ""})
        elif role in ("user", "human"):
            out.append({"role": "user", "content": content or ""})
    # Claude requires alternating roles; merge consecutive same-role messages
    merged: list[dict] = []
    for m in out:
        if merged and merged[-1]["role"] == m["role"]:
            merged[-1]["content"] = f"{merged[-1]['content']}\n{m['content']}"
        else:
            merged.append(m)
    if merged and merged[0]["role"] != "user":
        merged.insert(0, {"role": "user", "content": "Hello"})
    return merged


@csrf_exempt
def chat_completions(request):
    """OpenAI-compatible chat completions endpoint for Vapi's custom LLM mode.

    Vapi POSTs the running conversation here on every turn; we run Anna's agentic
    loop (Claude + tools) and return a single completion. SSE streaming supported.
    """
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    if not _verify_chat_completions_secret(request):
        logger.warning("[CUSTOM LLM] Unauthorized — bad/missing shared secret")
        return JsonResponse({"error": "unauthorized"}, status=401)
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    messages = data.get("messages", [])
    caller_phone = None
    call_data = data.get("call") or {}
    call_id = (call_data.get("id") or "").strip() or None
    if call_data:
        caller_phone = (call_data.get("customer") or {}).get("number")
    if not caller_phone:
        caller_phone = (data.get("metadata") or {}).get("customerNumber")

    # Vapi posts status-update / function-call events to the same URL with no
    # `messages` array. Acknowledge with 200 so it doesn't retry-spam the log.
    if not messages:
        return JsonResponse({"ok": True, "ignored": "no messages payload"})

    logger.info("[CUSTOM LLM] %d messages, caller=%s", len(messages), caller_phone)
    claude_messages = _openai_to_claude(messages)
    if not claude_messages:
        return JsonResponse({"ok": True, "ignored": "no convertible messages"})

    try:
        result = handle_conversation_turn(claude_messages, caller_phone=caller_phone, call_id=call_id)
        text = result["text"]
        end_call = result["end_call"]
    except Exception as exc:  # noqa: BLE001
        logger.error("[CUSTOM LLM ERROR] %s", exc)
        text = "I'm sorry, I'm having a technical issue. Please call back in a moment."
        end_call = False

    if data.get("stream"):
        return _stream(text, end_call)

    return JsonResponse({
        "id": f"chatcmpl-{uuid.uuid4().hex[:12]}",
        "object": "chat.completion",
        "created": int(time.time()),
        "model": "hearthline-claude",
        "choices": [{
            "index": 0,
            "message": {"role": "assistant", "content": text},
            "finish_reason": "stop",
        }],
        "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
    })


def _stream(text: str, end_call: bool):
    completion_id = f"chatcmpl-{uuid.uuid4().hex[:12]}"

    def stream():
        chunk = {
            "id": completion_id,
            "object": "chat.completion.chunk",
            "created": int(time.time()),
            "model": "hearthline-claude",
            "choices": [{
                "index": 0,
                "delta": {"role": "assistant", "content": text},
                "finish_reason": None,
            }],
        }
        yield f"data: {json.dumps(chunk)}\n\n"
        stop = {
            "id": completion_id,
            "object": "chat.completion.chunk",
            "created": int(time.time()),
            "model": "hearthline-claude",
            "choices": [{"index": 0, "delta": {}, "finish_reason": "stop"}],
        }
        yield f"data: {json.dumps(stop)}\n\n"
        yield "data: [DONE]\n\n"

    resp = StreamingHttpResponse(stream(), content_type="text/event-stream")
    if end_call:
        resp["X-Vapi-End-Call"] = "true"
    return resp


@method_decorator(csrf_exempt, name="dispatch")
class VapiWebhook(APIView):
    """Vapi posts call lifecycle events here.

    We persist a Call row, and on `end-of-call-report` we capture the final
    transcript + summary so the dashboard's recent calls panel updates.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"status": "ok", "service": "Hearthline Vapi webhook"})

    def post(self, request):
        if not _verify_vapi_signature(request):
            logger.warning("[VAPI] rejected webhook — bad shared secret")
            return Response({"error": "unauthorized"}, status=401)
        payload = request.data if isinstance(request.data, dict) else json.loads(request.body)
        message = payload.get("message") or payload
        msg_type = message.get("type") or payload.get("type") or "unknown"
        call_data = message.get("call") or payload.get("call") or {}
        provider_call_id = call_data.get("id") or payload.get("callId") or "unknown"

        business = Business.objects.first()
        if not business:
            return Response({"error": "no business configured"}, status=400)

        from_number = (call_data.get("customer") or {}).get("number", "")
        to_number = (call_data.get("phoneNumber") or {}).get("number", "")

        transcript = message.get("transcript", "") or payload.get("transcript", "")
        summary = message.get("summary", "") or payload.get("summary", "")
        recording = call_data.get("recordingUrl", "")

        duration = call_data.get("duration") or message.get("durationSeconds")
        if not duration:
            cost = message.get("costBreakdown") or {}
            duration = cost.get("duration") or cost.get("durationSeconds")

        status_map = {
            "end-of-call-report": "completed",
            "status-update": "in_progress",
            "function-call": "in_progress",
            "speech-update": "in_progress",
            "hang": "completed",
        }

        call, _ = Call.objects.update_or_create(
            provider="vapi",
            provider_call_id=provider_call_id,
            defaults={
                "business": business,
                "from_number": from_number,
                "to_number": to_number,
                "status": status_map.get(msg_type, "in_progress"),
                "duration_seconds": int(duration) if duration else None,
                "recording_url": recording or "",
                "transcript": transcript,
                "summary": summary,
                "raw_payload": payload,
            },
        )
        logger.info("[VAPI] %s id=%s call=%s", msg_type, provider_call_id, call.id)
        return Response({"ok": True, "call_id": call.id})


@method_decorator(csrf_exempt, name="dispatch")
class TwilioWebhook(APIView):
    """Twilio voice/SMS webhook handler."""
    permission_classes = [AllowAny]

    def post(self, request):
        if not _verify_twilio_signature(request):
            logger.warning("[TWILIO] rejected webhook — bad signature")
            return Response({"error": "unauthorized"}, status=401)
        data = request.data
        provider_call_id = data.get("CallSid") or data.get("MessageSid") or "unknown"
        business = Business.objects.first()
        if not business:
            return Response({"error": "no business configured"}, status=400)
        call, _ = Call.objects.update_or_create(
            provider="twilio",
            provider_call_id=provider_call_id,
            defaults={
                "business": business,
                "from_number": data.get("From", ""),
                "to_number": data.get("To", ""),
                "status": data.get("CallStatus", "in_progress"),
                "raw_payload": dict(data),
            },
        )
        return Response({"ok": True, "call_id": call.id})
