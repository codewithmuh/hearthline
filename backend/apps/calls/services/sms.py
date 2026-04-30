"""Twilio SMS service. Falls back to a no-op log if Twilio creds are missing."""
import logging

from django.conf import settings

logger = logging.getLogger(__name__)


def send_sms(to: str, message: str) -> dict:
    """Send an SMS via Twilio. Returns {success: bool, sid?, error?}."""
    if not (settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_FROM_NUMBER):
        logger.info("[SMS STUB] to=%s | %s", to, message[:160])
        return {"success": True, "sid": "stub", "stubbed": True}
    try:
        from twilio.rest import Client  # noqa: WPS433
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        result = client.messages.create(body=message, from_=settings.TWILIO_FROM_NUMBER, to=to)
        logger.info("[SMS SENT] to=%s sid=%s", to, result.sid)
        return {"success": True, "sid": result.sid}
    except Exception as exc:  # noqa: BLE001
        logger.error("[SMS ERROR] %s", exc)
        return {"success": False, "error": str(exc)}
