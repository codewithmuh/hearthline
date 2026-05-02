"""Smoke tests for the tool implementations Anna calls during a live call.

These don't hit Anthropic/OpenAI — they exercise the Django side of the loop:
the qualify_lead and book_appointment tools that persist Lead/Customer rows.
"""
from django.test import TestCase

from apps.calls.services.persistence import book_appointment_tool, qualify_lead_tool
from apps.core.models import Business
from apps.leads.models import Lead


class QualifyLeadToolTests(TestCase):
    def setUp(self):
        self.business = Business.objects.create(name="Acme HVAC", slug="acme")

    def test_creates_customer_and_lead(self):
        result = qualify_lead_tool(
            {
                "customer_name": "Jane Doe",
                "project_summary": "Furnace making a clicking noise",
                "estimated_value": 450,
                "temperature": "warm",
            },
            verified_phone="+15551234567",
            call_id="vapi-call-abc",
        )

        self.assertTrue(result["success"])
        lead = Lead.objects.get(pk=result["lead_id"])
        self.assertEqual(lead.customer.phone, "+15551234567")
        self.assertEqual(lead.customer.name, "Jane Doe")
        self.assertEqual(lead.status, "qualifying")
        self.assertEqual(lead.extracted_fields["vapi_call_id"], "vapi-call-abc")

    def test_second_call_in_same_session_updates_same_lead(self):
        first = qualify_lead_tool(
            {"customer_name": "Jane Doe", "project_summary": "AC issue"},
            verified_phone="+15551234567",
            call_id="vapi-call-xyz",
        )
        second = qualify_lead_tool(
            {"project_summary": "AC unit fully dead, needs replacement"},
            verified_phone="+15551234567",
            call_id="vapi-call-xyz",
        )

        self.assertEqual(first["lead_id"], second["lead_id"])
        self.assertEqual(Lead.objects.count(), 1)

    def test_hallucinated_phone_does_not_overwrite_caller_id(self):
        result = qualify_lead_tool(
            {"customer_phone": "+15559999999"},
            verified_phone="+15551234567",
            call_id="vapi-call-1",
        )
        lead = Lead.objects.get(pk=result["lead_id"])
        self.assertEqual(lead.customer.phone, "+15551234567")
        self.assertEqual(lead.extracted_fields.get("callback_phone"), "+15559999999")


class BookAppointmentToolTests(TestCase):
    def setUp(self):
        self.business = Business.objects.create(name="Acme HVAC", slug="acme")

    def test_book_after_qualify_reuses_lead(self):
        qualify_lead_tool(
            {"customer_name": "Jane Doe", "project_summary": "Heater out"},
            verified_phone="+15551234567",
            call_id="call-42",
        )
        booking = book_appointment_tool(
            {
                "customer_name": "Jane Doe",
                "trade": "hvac",
                "date": "2026-05-15",
                "time": "10:00",
                "project_summary": "Heater repair",
            },
            verified_phone="+15551234567",
            call_id="call-42",
        )

        self.assertTrue(booking["success"])
        self.assertEqual(Lead.objects.count(), 1)
        lead = Lead.objects.get(pk=booking["lead_id"])
        self.assertEqual(lead.status, "booked")
