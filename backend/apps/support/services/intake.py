"""Inbound message → ticket pipeline. Channel-agnostic; channels call this."""
from __future__ import annotations

import logging

from django.utils import timezone

from apps.core.models import Business
from apps.support.models import Ticket, TicketMessage

from .responder import generate_reply
from .whatsapp import send_text as send_whatsapp_text
from .whatsapp_lead import reply_for_whatsapp_ticket

logger = logging.getLogger(__name__)


def handle_inbound(
    *,
    business: Business,
    channel: str,
    sender_id: str,
    sender_name: str,
    body: str,
    provider_message_id: str = "",
) -> dict:
    """Persist the inbound message, route to AI (or hold for human), reply on the channel.

    Returns {ticket_id, reply, sent} for logging. Never raises.
    """
    if provider_message_id and TicketMessage.objects.filter(
        provider_message_id=provider_message_id,
    ).exists():
        logger.info("[SUPPORT INTAKE] dedup hit msg_id=%s", provider_message_id)
        return {"ticket_id": None, "reply": "", "sent": False, "dedup": True}

    ticket = (
        Ticket.objects.filter(
            business=business, channel=channel, sender_id=sender_id,
        )
        .exclude(status="resolved")
        .order_by("-created_at")
        .first()
    )
    if ticket is None:
        ticket = Ticket.objects.create(
            business=business,
            channel=channel,
            sender_id=sender_id,
            sender_name=sender_name or sender_id,
            subject=body[:80],
        )
    elif sender_name and not ticket.sender_name:
        ticket.sender_name = sender_name

    now = timezone.now()
    TicketMessage.objects.create(
        ticket=ticket,
        direction="in",
        author="customer",
        body=body,
        provider_message_id=provider_message_id,
    )
    ticket.last_message_at = now
    if ticket.status == "resolved":
        ticket.status = "open"
    ticket.save(update_fields=["sender_name", "last_message_at", "status", "updated_at"])

    if ticket.human_only:
        logger.info("[SUPPORT INTAKE] ticket=%s human_only — no AI reply", ticket.pk)
        return {"ticket_id": ticket.pk, "reply": "", "sent": False, "human_only": True}

    # WhatsApp gets the full Anna receptionist loop (qualify_lead, draft_quote,
    # book_appointment) so a customer chat creates real Lead + Quote rows.
    # Other channels still use the lightweight knowledge-base responder.
    if channel == "whatsapp":
        reply = reply_for_whatsapp_ticket(ticket)
    else:
        reply = generate_reply(ticket)
    if not reply:
        return {"ticket_id": ticket.pk, "reply": "", "sent": False}

    sent_meta = _send(channel, business, sender_id, reply)
    TicketMessage.objects.create(
        ticket=ticket,
        direction="out",
        author="ai",
        body=reply,
        provider_message_id=sent_meta.get("provider_message_id", ""),
        metadata={"send_ok": sent_meta.get("ok", False), "error": sent_meta.get("error", "")},
    )
    ticket.last_message_at = timezone.now()
    ticket.save(update_fields=["last_message_at", "updated_at"])

    return {
        "ticket_id": ticket.pk,
        "reply": reply,
        "sent": sent_meta.get("ok", False),
    }


def _send(channel: str, business: Business, to: str, body: str) -> dict:
    if channel == "whatsapp":
        return send_whatsapp_text(business, to, body)
    logger.warning("[SUPPORT INTAKE] no sender wired for channel=%s", channel)
    return {"ok": False, "error": f"no_sender_for_{channel}"}
