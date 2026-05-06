"""WhatsApp Cloud API helpers — parse inbound webhooks, send outbound text messages."""
from __future__ import annotations

import logging
from dataclasses import dataclass

import requests

from apps.core.models import Business

logger = logging.getLogger(__name__)

WHATSAPP_API_URL = "https://graph.facebook.com/v22.0"
SEND_TIMEOUT = 15


@dataclass
class InboundWhatsApp:
    business: Business
    sender_id: str
    sender_name: str
    body: str
    provider_message_id: str
    phone_number_id: str


def parse_webhook(payload: dict) -> InboundWhatsApp | None:
    """Pull a single text/interactive message out of a Meta webhook payload.

    Returns None for status updates, unsupported types, or payloads that don't
    map to a known business via the recipient phone_number_id.
    """
    try:
        entry = (payload or {}).get("entry") or []
        if not entry:
            return None
        changes = entry[0].get("changes") or []
        if not changes:
            return None
        value = changes[0].get("value") or {}
        messages = value.get("messages") or []
        if not messages:
            return None

        msg = messages[0]
        msg_type = msg.get("type", "")

        if msg_type == "text":
            body = (msg.get("text") or {}).get("body", "")
        elif msg_type == "interactive":
            interactive = msg.get("interactive") or {}
            sub = interactive.get("type", "")
            if sub == "button_reply":
                body = (interactive.get("button_reply") or {}).get("title", "")
            elif sub == "list_reply":
                body = (interactive.get("list_reply") or {}).get("title", "")
            else:
                body = ""
        else:
            logger.info("Unsupported WhatsApp message type: %s", msg_type)
            return None

        body = (body or "").strip()
        if not body:
            return None

        sender_id = msg.get("from", "")
        provider_message_id = msg.get("id", "")
        phone_number_id = (value.get("metadata") or {}).get("phone_number_id", "")

        contacts = value.get("contacts") or []
        sender_name = ""
        if contacts:
            sender_name = (contacts[0].get("profile") or {}).get("name", "")

        business = _resolve_business(phone_number_id)
        if business is None:
            logger.warning(
                "WhatsApp inbound for unknown phone_number_id=%s — ignoring", phone_number_id,
            )
            return None

        return InboundWhatsApp(
            business=business,
            sender_id=sender_id,
            sender_name=sender_name,
            body=body,
            provider_message_id=provider_message_id,
            phone_number_id=phone_number_id,
        )

    except Exception as exc:  # noqa: BLE001 — Meta payloads are wild; never crash the webhook
        logger.exception("Failed to parse WhatsApp webhook: %s", exc)
        return None


def _resolve_business(phone_number_id: str) -> Business | None:
    """Match an inbound phone_number_id to the business that owns it.

    Currently single-tenant — falls back to the only Business when no match.
    Once multi-tenant, this is the lookup that routes inbound to the right team.
    """
    if phone_number_id:
        match = Business.objects.filter(whatsapp_phone_number_id=phone_number_id).first()
        if match:
            return match
    return Business.objects.first()


def send_document(business: Business, to: str, link: str, filename: str, caption: str = "") -> dict:
    """Send a hosted PDF/document by URL via Meta's WhatsApp Cloud API."""
    token = business.resolved_whatsapp_token
    phone_id = business.resolved_whatsapp_phone_id
    if not token or not phone_id:
        logger.error("WhatsApp credentials missing for business %s", business.pk)
        return {"ok": False, "error": "whatsapp_not_configured"}

    url = f"{WHATSAPP_API_URL}/{phone_id}/messages"
    document = {"link": link, "filename": filename}
    if caption:
        document["caption"] = caption[:1024]
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "document",
        "document": document,
    }
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=SEND_TIMEOUT)
        response.raise_for_status()
        data = response.json()
        out_id = ""
        try:
            out_id = (data.get("messages") or [{}])[0].get("id", "")
        except Exception:  # noqa: BLE001
            pass
        logger.info("[WHATSAPP DOC] biz=%s to=%s id=%s url=%s", business.pk, to, out_id, link)
        return {"ok": True, "provider_message_id": out_id}
    except requests.RequestException as exc:
        logger.exception("[WHATSAPP DOC ERROR] biz=%s to=%s err=%s", business.pk, to, exc)
        return {"ok": False, "error": str(exc)}


def send_text(business: Business, to: str, body: str) -> dict:
    """Send a plain-text WhatsApp message. Returns {ok, ...} for logging."""
    token = business.resolved_whatsapp_token
    phone_id = business.resolved_whatsapp_phone_id
    if not token or not phone_id:
        logger.error("WhatsApp credentials missing for business %s", business.pk)
        return {"ok": False, "error": "whatsapp_not_configured"}

    url = f"{WHATSAPP_API_URL}/{phone_id}/messages"
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "text",
        "text": {"preview_url": False, "body": body},
    }
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=SEND_TIMEOUT)
        response.raise_for_status()
        data = response.json()
        out_id = ""
        try:
            out_id = (data.get("messages") or [{}])[0].get("id", "")
        except Exception:
            pass
        logger.info("[WHATSAPP SEND] biz=%s to=%s id=%s", business.pk, to, out_id)
        return {"ok": True, "provider_message_id": out_id}
    except requests.RequestException as exc:
        logger.exception("[WHATSAPP SEND ERROR] biz=%s to=%s err=%s", business.pk, to, exc)
        return {"ok": False, "error": str(exc)}
