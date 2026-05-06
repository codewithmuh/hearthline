"""Run Anna's full receptionist loop over a WhatsApp ticket.

Reuses apps.calls.agent.receptionist.handle_conversation_turn so the same
brain (qualify_lead, draft_quote, book_appointment, send_sms, end_call) that
handles phone calls also runs on inbound WhatsApp threads. Customer's WA
number is mapped to caller_phone, and the ticket id is mapped to call_id so
tool dedupe still works.

Side effects:
- After Anna's turn, if a Quote was just drafted for this conversation, we
  render the PDF and send it as a WhatsApp document to the customer. This
  is the WA equivalent of the spoken "I'm texting you the breakdown" that
  Anna does on phone calls.

Returns the assistant's reply text (or "" when nothing to say).
"""
from __future__ import annotations

import logging
import os

from apps.calls.agent.receptionist import handle_conversation_turn
from apps.quotes.models import Quote
from apps.quotes.services.pdf import render_quote_pdf
from apps.support.models import Ticket, TicketMessage
from apps.support.services.whatsapp import send_document

logger = logging.getLogger(__name__)

HISTORY_LIMIT = 20


def _history_for_anna(ticket: Ticket) -> list[dict]:
    rows = list(
        TicketMessage.objects.filter(ticket=ticket)
        .order_by("-created_at")
        .values("author", "body")[:HISTORY_LIMIT]
    )
    rows.reverse()
    out: list[dict] = []
    for row in rows:
        role = "user" if row["author"] == "customer" else "assistant"
        out.append({"role": role, "content": row["body"] or ""})
    if out and out[0]["role"] != "user":
        out.insert(0, {"role": "user", "content": "Hello"})
    return out


def _quote_pdf_path(quote: Quote) -> str:
    base = os.environ.get("QUOTE_PDF_DIR", "/var/data/quotes")
    try:
        os.makedirs(base, exist_ok=True)
    except OSError:
        base = "/tmp/quotes"
        os.makedirs(base, exist_ok=True)
    return os.path.join(base, f"{quote.public_token}.pdf")


def _public_quote_url(quote: Quote) -> str:
    # The /q/<token> route is on the Django backend, so the customer-facing
    # link must use API_DOMAIN. APP_DOMAIN only points at the Next.js frontend.
    host = os.environ.get("API_DOMAIN", "").strip()
    return f"https://{host}/q/{quote.public_token}" if host else ""


def _maybe_send_pdf(ticket: Ticket, call_id: str) -> None:
    """If Anna just drafted a Quote for this WA conversation, render + send PDF."""
    quote = (
        Quote.objects.filter(photo_assessment__drafted_during_call=call_id)
        .order_by("-created_at")
        .first()
    )
    if not quote:
        return
    if quote.photo_assessment.get("whatsapp_sent_to") == ticket.sender_id:
        # Already delivered for this WA conversation.
        return

    try:
        path = _quote_pdf_path(quote)
        with open(path, "wb") as fh:
            fh.write(render_quote_pdf(quote))
    except Exception as exc:  # noqa: BLE001
        logger.exception("[WA LEAD] PDF render failed: %s", exc)
        return

    public_url = _public_quote_url(quote)
    if not public_url:
        logger.warning("[WA LEAD] no APP_DOMAIN/API_DOMAIN configured — can't host PDF")
        return

    if quote.pdf_url != public_url:
        quote.pdf_url = public_url
        quote.save(update_fields=["pdf_url"])

    sent = send_document(
        business=ticket.business,
        to=ticket.sender_id,
        link=public_url,
        filename=f"quote-{quote.reference}.pdf",
        caption=f"Estimate {quote.reference} — total {quote.total}",
    )
    if sent.get("ok"):
        meta = dict(quote.photo_assessment or {})
        meta["whatsapp_sent_to"] = ticket.sender_id
        quote.photo_assessment = meta
        if quote.status == "draft":
            quote.status = "sent"
        quote.save(update_fields=["photo_assessment", "status"])


def reply_for_whatsapp_ticket(ticket: Ticket) -> str:
    """Run one Anna turn against the ticket and return her reply text."""
    history = _history_for_anna(ticket)
    if not history:
        return ""
    caller_phone = (ticket.sender_id or "").strip() or None
    # `wa-<ticket.id>` is unique per WA conversation so qualify_lead/draft_quote
    # dedupe correctly. The 'wa-' prefix avoids clashing with Vapi call ids.
    call_id = f"wa-{ticket.pk}"
    try:
        result = handle_conversation_turn(history, caller_phone=caller_phone, call_id=call_id)
    except Exception as exc:  # noqa: BLE001 — never crash the webhook
        logger.exception("[WA LEAD] handle_conversation_turn failed: %s", exc)
        return ""

    # Best-effort: if a quote was just drafted, deliver the PDF over WA.
    try:
        _maybe_send_pdf(ticket, call_id)
    except Exception as exc:  # noqa: BLE001
        logger.exception("[WA LEAD] _maybe_send_pdf failed: %s", exc)

    return (result.get("text") or "").strip()
