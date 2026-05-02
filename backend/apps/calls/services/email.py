"""Outbound email service. Falls back to a console log if SMTP isn't configured."""
import logging

from django.conf import settings
from django.core.mail import EmailMessage

logger = logging.getLogger(__name__)


def send_email(to: str, subject: str, body: str, business=None) -> dict:
    """Send a transactional email. Returns {success: bool, stubbed?, error?}."""
    to = (to or "").strip()
    if not to:
        return {"success": False, "error": "Missing recipient email."}

    from_addr = (
        getattr(settings, "DEFAULT_FROM_EMAIL", "") or
        getattr(settings, "EMAIL_HOST_USER", "") or
        "no-reply@hearthline.local"
    )

    # No SMTP configured → log to stdout so docker logs shows what would have sent.
    has_smtp = bool(getattr(settings, "EMAIL_HOST", "") and getattr(settings, "EMAIL_HOST_USER", ""))
    if not has_smtp:
        logger.info("[EMAIL STUB] (no SMTP) to=%s subject=%s", to, subject)
        logger.info("[EMAIL STUB BODY] %s", body[:400])
        return {"success": True, "stubbed": True}

    try:
        EmailMessage(subject=subject, body=body, from_email=from_addr, to=[to]).send(fail_silently=False)
        logger.info("[EMAIL SENT] to=%s subject=%s", to, subject)
        return {"success": True}
    except Exception as exc:  # noqa: BLE001
        logger.error("[EMAIL ERROR] to=%s err=%s", to, exc)
        return {"success": False, "error": str(exc)}
