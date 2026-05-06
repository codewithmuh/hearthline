"""Seed one dummy WhatsApp support ticket + one dummy WhatsApp lead.

All identifiers are obviously fake (`+10000000999`, `wa.demo@example.test`)
so this can run in any environment without touching real customer records.
Idempotent — uses a sentinel `extracted_fields.demo_seed = "wa-dummy-1"` to
detect existing rows and update instead of duplicate.

Usage:
    python manage.py seed_whatsapp_demo
"""
from __future__ import annotations

from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.core.models import Business
from apps.leads.models import Conversation, Customer, Lead, Message
from apps.support.models import Ticket, TicketMessage


DEMO_SENTINEL = "wa-dummy-1"

# Obviously-fake contact details. Do not edit to a real number / email.
DEMO_NAME = "WA Demo Customer"
DEMO_PHONE = "+10000000999"
DEMO_EMAIL = "wa.demo@example.test"
DEMO_ADDRESS = "1 Demo Street, Demoville"


class Command(BaseCommand):
    help = "Create one dummy WhatsApp ticket + lead with fake contact details."

    def handle(self, *args, **options):
        business = Business.objects.order_by("id").first()
        if business is None:
            self.stderr.write("No Business in the database — create one first.")
            return

        ticket = self._upsert_ticket(business)
        lead = self._upsert_lead(business)

        self.stdout.write(self.style.SUCCESS(
            f"Seeded WA demo: ticket #{ticket.pk} + lead #{lead.pk}"
        ))

    def _upsert_ticket(self, business: Business) -> Ticket:
        ticket = Ticket.objects.filter(
            business=business, channel="whatsapp", sender_id=DEMO_PHONE,
        ).first()
        now = timezone.now()
        if ticket is None:
            ticket = Ticket.objects.create(
                business=business,
                channel="whatsapp",
                sender_id=DEMO_PHONE,
                sender_name=DEMO_NAME,
                subject="(demo) Quote for 5 kW solar in Multan",
                status="open",
                last_message_at=now,
            )
            self._seed_ticket_messages(ticket)
        return ticket

    def _seed_ticket_messages(self, ticket: Ticket) -> None:
        TicketMessage.objects.create(
            ticket=ticket, direction="in", author="customer",
            body="Hi, I'd like a quote for a 5 kW solar system at my home in Multan.",
        )
        TicketMessage.objects.create(
            ticket=ticket, direction="out", author="ai",
            body="Hi! Happy to help. A 5 kW on-grid system is around Rs 825,000 — includes "
                 "panels, inverter, mounting, wiring, and net-metering paperwork. "
                 "Could I have your name and the rooftop area available?",
        )
        TicketMessage.objects.create(
            ticket=ticket, direction="in", author="customer",
            body="Demo Customer here, roughly 600 sq ft south-facing roof.",
        )

    def _upsert_lead(self, business: Business) -> Lead:
        existing = Lead.objects.filter(
            extracted_fields__demo_seed=DEMO_SENTINEL,
        ).first()
        if existing:
            return existing

        customer, _ = Customer.objects.get_or_create(
            phone=DEMO_PHONE,
            defaults={"name": DEMO_NAME, "email": DEMO_EMAIL, "address": DEMO_ADDRESS},
        )
        if not customer.name:
            customer.name = DEMO_NAME
        if not customer.email:
            customer.email = DEMO_EMAIL
        if not customer.address:
            customer.address = DEMO_ADDRESS
        customer.save()

        lead = Lead.objects.create(
            business=business,
            customer=customer,
            project_summary="(demo) 5 kW on-grid solar system, ~600 sq ft south-facing roof, Multan",
            status="qualifying",
            temperature="warm",
            estimated_value=Decimal("825000"),
            extracted_fields={
                "demo_seed": DEMO_SENTINEL,
                "channel": "whatsapp",
                "city": "Multan",
                "system_size_kw": 5,
                "roof_type": "concrete",
                "monthly_bill_pkr": 28000,
                "trade": "solar",
            },
        )

        convo = Conversation.objects.create(lead=lead)
        Message.objects.create(
            conversation=convo, direction="in", role="user",
            body="Hi, I'd like a quote for a 5 kW solar system at my home in Multan.",
        )
        Message.objects.create(
            conversation=convo, direction="out", role="assistant",
            body="A 5 kW on-grid system is around Rs 825,000 — includes panels, inverter, "
                 "mounting, wiring, and net-metering paperwork. Could I have your name "
                 "and roof area to firm up the quote?",
        )
        Message.objects.create(
            conversation=convo, direction="in", role="user",
            body="Demo Customer, ~600 sq ft south-facing roof.",
        )
        return lead
