"""Seed Hearthline with believable demo data so the dashboard isn't empty.

Usage:
    docker compose exec backend python manage.py seed_demo
    docker compose exec backend python manage.py seed_demo --wipe
"""
from __future__ import annotations

import random
from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.calls.models import Call
from apps.core.models import Business, Channel
from apps.leads.models import Conversation, Customer, Lead, Message
from apps.quotes.models import LineItem, Quote


CUSTOMERS = [
    ("Mark Johnson", "+1 (555) 777-8888", "mark.johnson@example.com", "1820 Oak St, Sacramento, CA"),
    ("Alice Smith", "+1 (555) 612-1109", "alice@example.com", "44 Maple Ave, Berkeley, CA"),
    ("David Chen", "+1 (555) 333-9999", "david.chen@example.com", "207 Pine Ridge Dr, Oakland, CA"),
    ("Sara Patel", "+1 (555) 220-4416", "sara.patel@example.com", "9 Elm Ct, Walnut Creek, CA"),
    ("Liam Bauer", "+1 (555) 221-7430", "liam@bauerhomes.io", "1133 Cedar Ln, San Jose, CA"),
    ("Emma Walsh", "+1 (555) 901-3382", "emma@walshroofing.io", "651 Hillside Rd, Palo Alto, CA"),
    ("Diego Ruiz", "+1 (555) 991-3340", "diego.ruiz@example.com", "78 Sunset Blvd, San Mateo, CA"),
    ("Olivia Park", "+1 (555) 803-2240", "olivia@bayhvac.com", "320 Bayshore Ave, Redwood City, CA"),
]


LEADS = [
    {
        "summary": "5 PVC windows for living room, white frame, standard sizing.",
        "status": "won",
        "temp": "hot",
        "value": 3520,
        "extracted": {"trade": "windows", "units": 5, "material": "white PVC", "urgency": "this_month"},
    },
    {
        "summary": "Roof replacement quote — approx 2,000 sq ft, asphalt shingles.",
        "status": "quoted",
        "temp": "warm",
        "value": 8500,
        "extracted": {"trade": "roofing", "sqft": 2000, "urgency": "this_month"},
    },
    {
        "summary": "HVAC install for 3-bed home, asking about smart-thermostat add-on.",
        "status": "booked",
        "temp": "hot",
        "value": 12300,
        "extracted": {"trade": "hvac", "units": 1, "addons": ["thermostat"], "urgency": "this_week"},
    },
    {
        "summary": "Status check on order #5521 — windows pending delivery.",
        "status": "qualifying",
        "temp": "warm",
        "value": None,
        "extracted": {"trade": "windows", "type": "support", "order_id": "5521"},
    },
    {
        "summary": "Solar panels — wants subsidy eligibility before signing.",
        "status": "quoted",
        "temp": "warm",
        "value": 18750,
        "extracted": {"trade": "solar", "subsidy_check": True},
    },
    {
        "summary": "Garage door repair — motorised, schedule needed Saturday.",
        "status": "booked",
        "temp": "hot",
        "value": 380,
        "extracted": {"trade": "doors", "type": "repair", "urgency": "this_week"},
    },
    {
        "summary": "Drain backing up after Tuesday's plumbing visit. Needs follow-up.",
        "status": "qualifying",
        "temp": "hot",
        "value": None,
        "extracted": {"trade": "plumbing", "type": "follow_up"},
    },
    {
        "summary": "Insulation upgrade for energy-renovation rebate program.",
        "status": "new",
        "temp": "cold",
        "value": 6200,
        "extracted": {"trade": "renovation", "subsidy_check": True},
    },
]


CALLS = [
    {
        "from": "+15557778888",
        "transcript": "Hi, I'm Mark Johnson. I'd like to replace 5 windows in my living room — white PVC, standard size. Can you quote that?",
        "summary": "Window replacement quote request — 5 units, white PVC, standard sizing. Customer pre-qualified for site survey.",
        "status": "completed",
        "duration": 184,
    },
    {
        "from": "+15553339999",
        "transcript": "Hello, this is David. Need a quote on roof replacement, approximately 2000 square feet, single-story home.",
        "summary": "Roof replacement enquiry — 2,000 sqft. Quote drafted at $8,500. Customer requested PDF.",
        "status": "completed",
        "duration": 142,
    },
    {
        "from": "+15558032240",
        "transcript": "Hi, this is Olivia from Bay HVAC. We had a customer ask about your wholesale rates for residential AC units.",
        "summary": "B2B enquiry — wholesale AC unit pricing. Routed to commercial team.",
        "status": "completed",
        "duration": 96,
    },
    {
        "from": "+15552207430",
        "transcript": "",
        "summary": "",
        "status": "no_answer",
        "duration": 0,
    },
    {
        "from": "+15556121109",
        "transcript": "Hi, this is Alice Smith — when will my windows be delivered? Order number is 5521.",
        "summary": "Status enquiry — order #5521. Confirmed delivery scheduled for next Tuesday.",
        "status": "completed",
        "duration": 64,
    },
]


QUOTES = [
    {
        "ref": "HL-A1F3C2",
        "lead_idx": 0,
        "items": [
            ("Standard PVC window 1.2m × 1.4m", 5, 580),
            ("Removal & disposal of existing units", 5, 60),
            ("Site survey + measurement", 1, 150),
        ],
        "notes": "Prices indicative pending in-person measurement. Includes labour and materials.",
        "status": "accepted",
    },
    {
        "ref": "HL-B7D219",
        "lead_idx": 1,
        "items": [
            ("Asphalt shingle roof — 2,000 sq ft", 1, 7200),
            ("Tear-off and disposal", 1, 850),
            ("Drip edge + ice/water shield", 1, 450),
        ],
        "notes": "Two-year workmanship warranty. Subject to inspection of decking on first day.",
        "status": "sent",
    },
    {
        "ref": "HL-C9E417",
        "lead_idx": 2,
        "items": [
            ("Carrier 16 SEER 3-ton AC unit", 1, 8500),
            ("Smart thermostat — Ecobee Premium", 1, 320),
            ("Install + first-year service plan", 1, 3480),
        ],
        "notes": "Includes haul-away of existing unit and rebate paperwork submission.",
        "status": "accepted",
    },
    {
        "ref": "HL-D2A841",
        "lead_idx": 4,
        "items": [
            ("Solar PV 6 kW system + inverter", 1, 14200),
            ("Roof mounting + electrical", 1, 3200),
            ("Permitting + interconnect", 1, 1350),
        ],
        "notes": "State rebate of $2,400 to be applied at acceptance. ITC eligible.",
        "status": "viewed",
    },
]


class Command(BaseCommand):
    help = "Seed Hearthline with believable demo data."

    def add_arguments(self, parser):
        parser.add_argument("--wipe", action="store_true", help="Delete existing demo data first.")

    def handle(self, *args, **opts):
        if opts.get("wipe"):
            self.stdout.write("Wiping…")
            Call.objects.all().delete()
            Quote.objects.all().delete()
            Lead.objects.all().delete()
            Customer.objects.all().delete()
            Channel.objects.all().delete()
            Business.objects.all().delete()

        biz, biz_created = Business.objects.get_or_create(
            slug="rolling-shutters-inc",
            defaults={
                "name": "Rolling Shutters Inc.",
                "trade": "windows",
                "timezone": "America/Los_Angeles",
                "phone_number": "+1 (555) 010-1010",
                "voice_persona": "Anna",
                "knowledge_base": (
                    "Standard PVC window: $580 / unit. Wood: $880 / unit. Roofing: $3.60 / sqft asphalt, "
                    "$7.50 / sqft tile. HVAC: 16 SEER 3-ton units start at $8,500 + install. "
                    "Service area: SF Bay Area. Same-week emergency: yes."
                ),
            },
        )
        self.stdout.write(f"  Business: {biz.name} ({'new' if biz_created else 'existing'})")

        # channels
        channel_specs = [
            ("phone", "+1 (555) 010-1010"),
            ("sms", "+1 (555) 010-1010"),
            ("email", "hi@rolling-shutters.example"),
            ("whatsapp", "+1 (555) 010-1010"),
            ("chat", "rolling-shutters.example/chat"),
        ]
        for kind, addr in channel_specs:
            Channel.objects.get_or_create(business=biz, kind=kind, address=addr, defaults={"is_active": True})
        self.stdout.write(f"  Channels: {biz.channels.count()}")

        # customers
        customer_objs: list[Customer] = []
        for name, phone, email, addr in CUSTOMERS:
            c, _ = Customer.objects.update_or_create(
                business=biz,
                phone=phone,
                defaults={"name": name, "email": email, "address": addr},
            )
            customer_objs.append(c)
        self.stdout.write(f"  Customers: {len(customer_objs)}")

        # leads
        now = timezone.now()
        lead_objs: list[Lead] = []
        for i, spec in enumerate(LEADS):
            cust = customer_objs[i % len(customer_objs)]
            lead = Lead.objects.create(
                business=biz,
                customer=cust,
                project_summary=spec["summary"],
                status=spec["status"],
                temperature=spec["temp"],
                estimated_value=Decimal(str(spec["value"])) if spec["value"] is not None else None,
                extracted_fields=spec["extracted"],
            )
            # backdate the created_at so the dashboard shows a spread of "X min/h ago"
            offset_min = i * 7 + random.randint(1, 5)
            Lead.objects.filter(pk=lead.pk).update(
                created_at=now - timedelta(minutes=offset_min),
                updated_at=now - timedelta(minutes=offset_min),
            )
            lead.refresh_from_db()
            lead_objs.append(lead)

            # one conversation + one inbound message per lead
            convo = Conversation.objects.create(lead=lead)
            Message.objects.create(
                conversation=convo,
                direction="in",
                role="customer",
                body=spec["summary"],
            )
        self.stdout.write(f"  Leads: {len(lead_objs)}")

        # calls
        for i, c in enumerate(CALLS):
            lead = lead_objs[i] if i < len(lead_objs) else None
            call = Call.objects.create(
                business=biz,
                lead=lead,
                provider="vapi",
                provider_call_id=f"demo_call_{i + 1:04d}",
                from_number=c["from"],
                to_number="+15550101010",
                status=c["status"],
                duration_seconds=c["duration"] or None,
                transcript=c["transcript"],
                summary=c["summary"],
                raw_payload={"demo": True},
            )
            Call.objects.filter(pk=call.pk).update(
                started_at=now - timedelta(minutes=i * 11 + 3),
                ended_at=now - timedelta(minutes=i * 11 + 1),
            )
        self.stdout.write(f"  Calls: {len(CALLS)}")

        # quotes
        for q in QUOTES:
            lead = lead_objs[q["lead_idx"]]
            subtotal = Decimal("0")
            quote = Quote.objects.create(
                lead=lead,
                reference=q["ref"],
                subtotal=Decimal("0"),
                tax=Decimal("0"),
                total=Decimal("0"),
                notes=q["notes"],
                status=q["status"],
                drafted_by_ai=True,
                photo_assessment={
                    "trade": lead.extracted_fields.get("trade"),
                    "scope_summary": lead.project_summary,
                    "source_photo": "https://example.com/demo-photo.jpg",
                },
            )
            for desc, qty, unit in q["items"]:
                line_total = Decimal(qty) * Decimal(unit)
                LineItem.objects.create(
                    quote=quote,
                    description=desc,
                    quantity=Decimal(qty),
                    unit_price=Decimal(unit),
                    total=line_total,
                )
                subtotal += line_total
            tax = (subtotal * Decimal("0.08")).quantize(Decimal("0.01"))
            quote.subtotal = subtotal
            quote.tax = tax
            quote.total = subtotal + tax
            quote.save(update_fields=["subtotal", "tax", "total"])
        self.stdout.write(f"  Quotes: {len(QUOTES)}")

        self.stdout.write(self.style.SUCCESS("Demo data seeded."))
