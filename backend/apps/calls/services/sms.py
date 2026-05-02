"""Twilio SMS service. Per-business creds win; env vars are the fallback."""
import logging

from django.conf import settings

logger = logging.getLogger(__name__)


def _resolve_creds(business=None) -> tuple[str, str, str]:
    """Per-business Twilio creds (saved in dashboard) override env vars."""
    if business is None:
        try:
            from apps.core.models import Business
            business = Business.objects.first()
        except Exception:  # noqa: BLE001
            business = None
    sid = (getattr(business, "resolved_twilio_sid", "") if business else "") or settings.TWILIO_ACCOUNT_SID
    token = (getattr(business, "resolved_twilio_token", "") if business else "") or settings.TWILIO_AUTH_TOKEN
    from_num = (getattr(business, "resolved_twilio_from", "") if business else "") or settings.TWILIO_FROM_NUMBER
    return (sid or "").strip(), (token or "").strip(), (from_num or "").strip()


def send_sms(to: str, message: str, business=None) -> dict:
    """Send an SMS via Twilio. Returns {success: bool, sid?, error?}."""
    sid, token, from_num = _resolve_creds(business)
    if not (sid and token and from_num):
        logger.info("[SMS STUB] (no twilio creds) to=%s | %s", to, message[:160])
        return {"success": True, "sid": "stub", "stubbed": True}
    try:
        from twilio.rest import Client  # noqa: WPS433
        client = Client(sid, token)
        result = client.messages.create(body=message, from_=from_num, to=to)
        logger.info("[SMS SENT] to=%s sid=%s", to, result.sid)
        return {"success": True, "sid": result.sid}
    except Exception as exc:  # noqa: BLE001
        logger.error("[SMS ERROR] to=%s err=%s", to, exc)
        return {"success": False, "error": str(exc)}
