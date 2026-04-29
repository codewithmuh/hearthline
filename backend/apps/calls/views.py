"""Vapi + Twilio webhook handlers.

These accept the provider's webhook payload, persist a Call row, and kick off
the LLM pipeline that extracts structured lead data from the transcript.

For local dev you'd point Vapi/Twilio webhook URLs at:
    https://<ngrok-url>/api/calls/webhooks/vapi/
    https://<ngrok-url>/api/calls/webhooks/twilio/
"""
from __future__ import annotations

import json

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.ai.services import extract_lead_from_transcript
from apps.core.models import Business
from apps.leads.models import Conversation, Customer, Lead, Message

from .models import Call
from .serializers import CallSerializer


class CallList(generics.ListAPIView):
    queryset = Call.objects.all().order_by("-started_at")
    serializer_class = CallSerializer
    permission_classes = [AllowAny]


@method_decorator(csrf_exempt, name="dispatch")
class VapiWebhook(APIView):
    """Vapi posts call lifecycle events here.

    Expected payload (simplified, see https://docs.vapi.ai/server-url):
        { "type": "end-of-call-report", "call": {...}, "transcript": "...", ... }
    """

    permission_classes = [AllowAny]

    def post(self, request):
        payload = request.data if isinstance(request.data, dict) else json.loads(request.body)
        event_type = payload.get("type") or payload.get("message", {}).get("type")
        call_data = payload.get("call") or payload.get("message", {}).get("call") or {}
        provider_call_id = call_data.get("id") or payload.get("callId") or "unknown"

        # Pick the first business for now (single-tenant local dev).
        business = Business.objects.first()
        if not business:
            return Response({"error": "no business configured"}, status=400)

        call, _ = Call.objects.update_or_create(
            provider="vapi",
            provider_call_id=provider_call_id,
            defaults={
                "business": business,
                "from_number": call_data.get("customer", {}).get("number", ""),
                "to_number": call_data.get("phoneNumber", {}).get("number", ""),
                "status": "completed" if event_type == "end-of-call-report" else "in_progress",
                "transcript": payload.get("transcript", "") or payload.get("message", {}).get("transcript", ""),
                "summary": payload.get("summary", "") or payload.get("message", {}).get("summary", ""),
                "recording_url": call_data.get("recordingUrl", ""),
                "raw_payload": payload,
            },
        )

        if event_type == "end-of-call-report" and call.transcript:
            _hydrate_lead_from_call(call)

        return Response({"ok": True, "call_id": call.id})


@method_decorator(csrf_exempt, name="dispatch")
class TwilioWebhook(APIView):
    """Twilio voice/SMS webhook handler. Twilio posts form-encoded data."""

    permission_classes = [AllowAny]

    def post(self, request):
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


def _hydrate_lead_from_call(call: Call) -> None:
    """Run the AI extraction pipeline and create / update a Lead from the call."""
    extracted = extract_lead_from_transcript(call.transcript, business=call.business)

    customer, _ = Customer.objects.get_or_create(
        business=call.business,
        phone=call.from_number or "",
        defaults={
            "name": extracted.get("customer_name", ""),
            "email": extracted.get("customer_email", ""),
            "address": extracted.get("address", ""),
        },
    )

    lead = Lead.objects.create(
        business=call.business,
        customer=customer,
        project_summary=extracted.get("project_summary", "")[:512],
        status="qualifying",
        temperature=extracted.get("temperature", "warm"),
        estimated_value=extracted.get("estimated_value"),
        extracted_fields=extracted,
    )
    call.lead = lead
    call.save(update_fields=["lead"])

    convo = Conversation.objects.create(lead=lead)
    Message.objects.create(
        conversation=convo,
        direction="in",
        role="customer",
        body=call.transcript[:8000],
    )
