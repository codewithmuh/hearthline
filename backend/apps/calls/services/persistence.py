"""Bridge tools → Hearthline domain models (Lead, Customer, Conversation, Call)."""
from __future__ import annotations

import logging
from decimal import Decimal
from typing import Any

from django.utils import timezone

from apps.core.models import Business
from apps.leads.models import Conversation, Customer, Lead, Message

logger = logging.getLogger(__name__)


def _default_business() -> Business | None:
    return Business.objects.first()


def upsert_customer(business: Business, name: str | None = None, phone: str | None = None,
                    email: str | None = None, address: str | None = None) -> Customer:
    """Find-or-create a Customer for this business, keyed by phone (then email)."""
    cust = None
    if phone:
        cust = Customer.objects.filter(business=business, phone=phone).first()
    if not cust and email:
        cust = Customer.objects.filter(business=business, email=email).first()
    if not cust:
        cust = Customer.objects.create(
            business=business,
            name=name or "",
            phone=phone or "",
            email=email or "",
            address=address or "",
        )
    else:
        # Patch in any new info we learned
        dirty = False
        if name and cust.name != name:
            cust.name = name
            dirty = True
        if email and cust.email != email:
            cust.email = email
            dirty = True
        if address and cust.address != address:
            cust.address = address
            dirty = True
        if dirty:
            cust.save()
    return cust


def qualify_lead_tool(payload: dict[str, Any]) -> dict[str, Any]:
    """Tool implementation: capture/update the lead record for the current call."""
    business = _default_business()
    if not business:
        return {"error": "No business configured. Add one in the dashboard settings."}

    cust = upsert_customer(
        business=business,
        name=payload.get("customer_name"),
        phone=payload.get("customer_phone"),
        email=payload.get("customer_email"),
        address=payload.get("address"),
    )

    extracted = {k: v for k, v in payload.items() if v is not None}
    estimated = payload.get("estimated_value")
    estimated_dec = Decimal(str(estimated)) if isinstance(estimated, (int, float)) else None

    lead = Lead.objects.create(
        business=business,
        customer=cust,
        project_summary=(payload.get("project_summary") or "")[:512],
        status="qualifying",
        temperature=payload.get("temperature") or "warm",
        estimated_value=estimated_dec,
        extracted_fields=extracted,
    )
    logger.info("[QUALIFY_LEAD] lead=%s customer=%s", lead.id, cust.id)
    return {
        "success": True,
        "lead_id": lead.id,
        "customer_id": cust.id,
        "message": f"Lead #{lead.id} created for {cust.name or cust.phone}",
    }


def book_appointment_tool(payload: dict[str, Any]) -> dict[str, Any]:
    """Tool implementation: book a confirmed service appointment.

    Creates a Lead with status='booked' (or upgrades the most recent qualifying
    lead for this caller) and a Conversation with a system message describing
    the booking.
    """
    business = _default_business()
    if not business:
        return {"error": "No business configured."}

    cust = upsert_customer(
        business=business,
        name=payload.get("customer_name"),
        phone=payload.get("customer_phone"),
        address=payload.get("address"),
    )

    estimated = payload.get("estimated_value")
    estimated_dec = Decimal(str(estimated)) if isinstance(estimated, (int, float)) else None

    booking_summary = (
        f"{payload.get('trade', 'service').title()} appointment on "
        f"{payload.get('date')} at {payload.get('time')}. "
        f"{payload.get('project_summary', '')}".strip()
    )

    # Re-use the most recent open lead for this customer if there is one
    lead = Lead.objects.filter(
        business=business, customer=cust, status__in=["new", "qualifying", "quoted"],
    ).order_by("-created_at").first()
    if lead:
        lead.status = "booked"
        lead.project_summary = booking_summary[:512]
        lead.estimated_value = estimated_dec or lead.estimated_value
        lead.extracted_fields = {
            **(lead.extracted_fields or {}),
            "booking": payload,
            "booked_at": timezone.now().isoformat(),
        }
        lead.save()
    else:
        lead = Lead.objects.create(
            business=business,
            customer=cust,
            project_summary=booking_summary[:512],
            status="booked",
            temperature="hot",
            estimated_value=estimated_dec,
            extracted_fields={"booking": payload, "booked_at": timezone.now().isoformat()},
        )

    convo = Conversation.objects.create(lead=lead)
    Message.objects.create(
        conversation=convo,
        direction="out",
        role="system",
        body=f"Booking confirmed: {booking_summary}",
    )
    logger.info("[BOOK] lead=%s when=%s %s", lead.id, payload.get("date"), payload.get("time"))
    return {
        "success": True,
        "lead_id": lead.id,
        "customer_id": cust.id,
        "message": f"Booked {booking_summary}",
    }
