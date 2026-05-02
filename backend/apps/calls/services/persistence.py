"""Bridge tools → Hearthline domain models (Lead, Customer, Conversation, Call)."""
from __future__ import annotations

import logging
import secrets
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


def _resolve_phone(payload: dict[str, Any], verified_phone: str | None) -> tuple[str | None, str | None]:
    """Pick the canonical phone (always the verified caller ID when present).

    Returns (canonical_phone, callback_phone). If the LLM passed a different
    number, surface it as a separate callback so the human team can see what
    the caller asked us to use, but the customer record is keyed by the real
    caller ID — never a hallucinated value.
    """
    llm_phone = (payload.get("customer_phone") or "").strip() or None
    verified = (verified_phone or "").strip() or None
    if verified:
        callback = llm_phone if (llm_phone and llm_phone != verified) else None
        return verified, callback
    return llm_phone, None


def _find_lead_for_call(business: Business, customer: Customer, call_id: str | None) -> Lead | None:
    """Find the Lead row that belongs to the active call.

    Strategy: prefer dedup by `vapi_call_id` stored in extracted_fields — that
    binds every tool fire within one phone call to a single Lead row. Fall
    back to the most recent open lead for this customer.
    """
    if call_id:
        existing = Lead.objects.filter(
            business=business, customer=customer,
            extracted_fields__vapi_call_id=call_id,
        ).order_by("-created_at").first()
        if existing:
            return existing
    return Lead.objects.filter(
        business=business, customer=customer,
        status__in=["new", "qualifying", "quoted", "booked"],
    ).order_by("-created_at").first()


def qualify_lead_tool(payload: dict[str, Any], verified_phone: str | None = None,
                      call_id: str | None = None) -> dict[str, Any]:
    """Tool implementation: capture/update the lead record for the current call."""
    business = _default_business()
    if not business:
        return {"error": "No business configured. Add one in the dashboard settings."}

    canonical_phone, callback_phone = _resolve_phone(payload, verified_phone)

    cust = upsert_customer(
        business=business,
        name=payload.get("customer_name"),
        phone=canonical_phone,
        email=payload.get("customer_email"),
        address=payload.get("address"),
    )

    extracted = {k: v for k, v in payload.items() if v is not None}
    if canonical_phone:
        extracted["customer_phone"] = canonical_phone
    if callback_phone:
        extracted["callback_phone"] = callback_phone
    if call_id:
        extracted["vapi_call_id"] = call_id
    estimated = payload.get("estimated_value")
    estimated_dec = Decimal(str(estimated)) if isinstance(estimated, (int, float)) else None
    summary = (payload.get("project_summary") or "")[:512]
    temperature = payload.get("temperature") or "warm"

    lead = _find_lead_for_call(business, cust, call_id)

    if lead:
        if summary:
            lead.project_summary = summary
        if estimated_dec is not None:
            lead.estimated_value = estimated_dec
        if temperature:
            lead.temperature = temperature
        lead.extracted_fields = {**(lead.extracted_fields or {}), **extracted}
        lead.status = "qualifying"
        lead.save()
        action = "updated"
    else:
        lead = Lead.objects.create(
            business=business,
            customer=cust,
            project_summary=summary,
            status="qualifying",
            temperature=temperature,
            estimated_value=estimated_dec,
            extracted_fields=extracted,
        )
        action = "created"

    logger.info("[QUALIFY_LEAD] %s lead=%s customer=%s", action, lead.id, cust.id)
    return {
        "success": True,
        "lead_id": lead.id,
        "customer_id": cust.id,
        "message": f"Lead #{lead.id} {action} for {cust.name or cust.phone}",
    }


def book_appointment_tool(payload: dict[str, Any], verified_phone: str | None = None,
                           call_id: str | None = None) -> dict[str, Any]:
    """Tool implementation: book a confirmed service appointment.

    Reuses the Lead row already opened by qualify_lead in this same call
    (matched by vapi_call_id), or the most recent open lead for the customer.
    """
    business = _default_business()
    if not business:
        return {"error": "No business configured."}

    canonical_phone, callback_phone = _resolve_phone(payload, verified_phone)

    cust = upsert_customer(
        business=business,
        name=payload.get("customer_name"),
        phone=canonical_phone,
        address=payload.get("address"),
    )

    estimated = payload.get("estimated_value")
    estimated_dec = Decimal(str(estimated)) if isinstance(estimated, (int, float)) else None

    booking_summary = (
        f"{payload.get('trade', 'service').title()} appointment on "
        f"{payload.get('date')} at {payload.get('time')}. "
        f"{payload.get('project_summary', '')}".strip()
    )

    lead = _find_lead_for_call(business, cust, call_id)
    booking_extracted = {
        "booking": payload,
        "booked_at": timezone.now().isoformat(),
    }
    if canonical_phone:
        booking_extracted["customer_phone"] = canonical_phone
    if callback_phone:
        booking_extracted["callback_phone"] = callback_phone
    if call_id:
        booking_extracted["vapi_call_id"] = call_id

    if lead:
        lead.status = "booked"
        lead.project_summary = booking_summary[:512]
        lead.estimated_value = estimated_dec or lead.estimated_value
        lead.extracted_fields = {
            **(lead.extracted_fields or {}),
            **booking_extracted,
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
            extracted_fields=booking_extracted,
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


def draft_quote_tool(payload: dict[str, Any], verified_phone: str | None = None,
                     call_id: str | None = None) -> dict[str, Any]:
    """Tool implementation: create a Quote on the active call's Lead.

    The Lead is found by `vapi_call_id` (the same dedup key used by qualify_lead
    and book_appointment), so all three tools land on one consistent row even
    if Anna fires them in a different order across turns.
    """
    from apps.quotes.models import LineItem, Quote
    business = _default_business()
    if not business:
        return {"error": "No business configured."}

    if not call_id:
        return {"error": "No call_id available — cannot tie quote to lead."}

    lead = Lead.objects.filter(
        business=business, extracted_fields__vapi_call_id=call_id,
    ).order_by("-created_at").first()
    if not lead:
        return {"error": "No lead found for this call. Run qualify_lead first."}

    raw_items = payload.get("line_items") or []
    line_items: list[dict[str, Any]] = []
    subtotal = Decimal("0")
    for item in raw_items:
        try:
            qty = Decimal(str(item.get("quantity", 1)))
            unit = Decimal(str(item.get("unit_price", 0)))
        except (ValueError, TypeError):
            continue
        line_total = (qty * unit).quantize(Decimal("0.01"))
        line_items.append({
            "description": (item.get("description") or "")[:255],
            "quantity": qty,
            "unit_price": unit,
            "total": line_total,
        })
        subtotal += line_total

    try:
        tax_rate = Decimal(str(payload.get("tax_rate", 0)))
    except (ValueError, TypeError):
        tax_rate = Decimal("0")
    tax = (subtotal * tax_rate).quantize(Decimal("0.01"))
    total = subtotal + tax
    notes = (payload.get("notes") or payload.get("summary") or "")[:1000]
    currency = (payload.get("currency") or "USD").strip()[:8]

    reference = "HL-" + secrets.token_hex(3).upper()
    quote = Quote.objects.create(
        lead=lead,
        reference=reference,
        subtotal=subtotal,
        tax=tax,
        total=total,
        notes=notes,
        status="draft",
        drafted_by_ai=True,
        photo_assessment={
            "scope_summary": (payload.get("summary") or "")[:1000],
            "currency": currency,
            "drafted_during_call": call_id,
        },
    )
    for li in line_items:
        LineItem.objects.create(quote=quote, **li)

    if lead.status == "qualifying":
        lead.status = "quoted"
        lead.estimated_value = total
        lead.save(update_fields=["status", "estimated_value", "updated_at"])

    logger.info("[DRAFT_QUOTE] quote=%s lead=%s items=%d total=%s %s",
                quote.id, lead.id, len(line_items), total, currency)
    return {
        "success": True,
        "quote_id": quote.id,
        "reference": reference,
        "total": str(total),
        "currency": currency,
        "items": len(line_items),
        "message": f"Quote {reference} drafted with {len(line_items)} line items, total {currency} {total}.",
    }
