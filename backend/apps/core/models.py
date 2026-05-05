from django.db import models

from .crypto import EncryptedCharField
from .trades import TRADES


class Business(models.Model):
    """A home-services business using Hearthline."""

    TRADE_CHOICES = TRADES

    LLM_PROVIDER_CHOICES = [
        ("anthropic", "Anthropic Claude"),
        ("openai", "OpenAI GPT"),
    ]

    # ISO-4217 codes for every currency Anna may need to speak. The dashboard
    # formats with Intl.NumberFormat using the matching locale; the spoken
    # guide for big-number conventions lives in apps/calls/agent/prompts.py.
    CURRENCY_CHOICES = [
        ("USD", "US Dollar ($)"),
        ("EUR", "Euro (€)"),
        ("GBP", "British Pound (£)"),
        ("CAD", "Canadian Dollar (C$)"),
        ("AUD", "Australian Dollar (A$)"),
        ("NZD", "New Zealand Dollar (NZ$)"),
        ("CHF", "Swiss Franc (CHF)"),
        ("SEK", "Swedish Krona (kr)"),
        ("NOK", "Norwegian Krone (kr)"),
        ("DKK", "Danish Krone (kr)"),
        ("PLN", "Polish Zloty (zł)"),
        ("CZK", "Czech Koruna (Kč)"),
        ("HUF", "Hungarian Forint (Ft)"),
        ("RON", "Romanian Leu (lei)"),
        ("TRY", "Turkish Lira (₺)"),
        ("RUB", "Russian Ruble (₽)"),
        ("UAH", "Ukrainian Hryvnia (₴)"),
        ("ILS", "Israeli Shekel (₪)"),
        ("AED", "UAE Dirham (د.إ)"),
        ("SAR", "Saudi Riyal (﷼)"),
        ("QAR", "Qatari Riyal (﷼)"),
        ("KWD", "Kuwaiti Dinar (د.ك)"),
        ("BHD", "Bahraini Dinar (.د.ب)"),
        ("OMR", "Omani Rial (﷼)"),
        ("JOD", "Jordanian Dinar (د.ا)"),
        ("EGP", "Egyptian Pound (£)"),
        ("LBP", "Lebanese Pound (ل.ل)"),
        ("MAD", "Moroccan Dirham (د.م.)"),
        ("DZD", "Algerian Dinar (د.ج)"),
        ("TND", "Tunisian Dinar (د.ت)"),
        ("ZAR", "South African Rand (R)"),
        ("NGN", "Nigerian Naira (₦)"),
        ("KES", "Kenyan Shilling (KSh)"),
        ("GHS", "Ghanaian Cedi (₵)"),
        ("ETB", "Ethiopian Birr (Br)"),
        ("UGX", "Ugandan Shilling (USh)"),
        ("TZS", "Tanzanian Shilling (TSh)"),
        ("PKR", "Pakistani Rupee (Rs)"),
        ("INR", "Indian Rupee (₹)"),
        ("BDT", "Bangladeshi Taka (৳)"),
        ("LKR", "Sri Lankan Rupee (Rs)"),
        ("NPR", "Nepalese Rupee (Rs)"),
        ("AFN", "Afghan Afghani (؋)"),
        ("CNY", "Chinese Yuan (¥)"),
        ("HKD", "Hong Kong Dollar (HK$)"),
        ("TWD", "Taiwan Dollar (NT$)"),
        ("JPY", "Japanese Yen (¥)"),
        ("KRW", "South Korean Won (₩)"),
        ("SGD", "Singapore Dollar (S$)"),
        ("MYR", "Malaysian Ringgit (RM)"),
        ("IDR", "Indonesian Rupiah (Rp)"),
        ("PHP", "Philippine Peso (₱)"),
        ("THB", "Thai Baht (฿)"),
        ("VND", "Vietnamese Dong (₫)"),
        ("MXN", "Mexican Peso ($)"),
        ("BRL", "Brazilian Real (R$)"),
        ("ARS", "Argentine Peso ($)"),
        ("CLP", "Chilean Peso ($)"),
        ("COP", "Colombian Peso ($)"),
        ("PEN", "Peruvian Sol (S/.)"),
        ("UYU", "Uruguayan Peso ($)"),
    ]

    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    trade = models.CharField(max_length=32, choices=TRADE_CHOICES, default="general")
    timezone = models.CharField(max_length=64, default="UTC")
    currency = models.CharField(
        max_length=3, choices=CURRENCY_CHOICES, default="USD",
        help_text="ISO-4217 code Anna quotes prices in and the dashboard formats with.",
    )
    phone_number = models.CharField(max_length=32, blank=True, help_text="Public business line")
    voice_persona = models.CharField(
        max_length=64, default="Anna",
        help_text="Display name for the AI receptionist"
    )
    knowledge_base = models.TextField(
        blank=True,
        help_text="Pricing rules, FAQ, service area — fed to the LLM as system prompt context",
    )

    llm_provider = models.CharField(
        max_length=16,
        choices=LLM_PROVIDER_CHOICES,
        default="anthropic",
        help_text="Which LLM powers Anna and lead extraction.",
    )

    # Provider credentials. When set, override the global env-var defaults.
    # Encrypted at rest via Fernet (apps.core.crypto.EncryptedCharField).
    anthropic_api_key = EncryptedCharField(blank=True, default="")
    openai_api_key = EncryptedCharField(blank=True, default="")
    vapi_api_key = EncryptedCharField(blank=True, default="")
    vapi_phone_number_id = EncryptedCharField(blank=True, default="")
    vapi_assistant_id = models.CharField(
        max_length=128, blank=True, default="",
        help_text="Vapi assistant ID — when set, name + voice persona changes auto-sync to Vapi.",
    )
    twilio_account_sid = EncryptedCharField(blank=True, default="")
    twilio_auth_token = EncryptedCharField(blank=True, default="")
    twilio_from_number = models.CharField(max_length=32, blank=True, default="")  # not a secret

    # WhatsApp Business Cloud API (Meta) — for inbound support tickets.
    whatsapp_access_token = EncryptedCharField(blank=True, default="")
    whatsapp_phone_number_id = models.CharField(max_length=64, blank=True, default="")
    whatsapp_verify_token = EncryptedCharField(blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Businesses"

    def __str__(self) -> str:
        return self.name

    # ---- Resolved credentials (per-business override → global env fallback) ----

    def _resolved(self, attr: str, env_attr: str) -> str:
        from django.conf import settings as dj_settings
        return (getattr(self, attr) or "").strip() or getattr(dj_settings, env_attr, "") or ""

    @property
    def resolved_anthropic_key(self) -> str:
        return self._resolved("anthropic_api_key", "ANTHROPIC_API_KEY")

    @property
    def resolved_openai_key(self) -> str:
        return self._resolved("openai_api_key", "OPENAI_API_KEY")

    @property
    def resolved_vapi_key(self) -> str:
        return self._resolved("vapi_api_key", "VAPI_API_KEY")

    @property
    def resolved_twilio_sid(self) -> str:
        return self._resolved("twilio_account_sid", "TWILIO_ACCOUNT_SID")

    @property
    def resolved_twilio_token(self) -> str:
        return self._resolved("twilio_auth_token", "TWILIO_AUTH_TOKEN")

    @property
    def resolved_twilio_from(self) -> str:
        return self._resolved("twilio_from_number", "TWILIO_FROM_NUMBER")

    @property
    def resolved_whatsapp_token(self) -> str:
        return self._resolved("whatsapp_access_token", "WHATSAPP_ACCESS_TOKEN")

    @property
    def resolved_whatsapp_phone_id(self) -> str:
        return self._resolved("whatsapp_phone_number_id", "WHATSAPP_PHONE_NUMBER_ID")

    @property
    def resolved_whatsapp_verify_token(self) -> str:
        return self._resolved("whatsapp_verify_token", "WHATSAPP_VERIFY_TOKEN")


class Channel(models.Model):
    """One inbound channel a business listens on (phone / sms / whatsapp / email / chat)."""

    KIND_CHOICES = [
        ("phone", "Phone"),
        ("sms", "SMS"),
        ("whatsapp", "WhatsApp"),
        ("email", "Email"),
        ("chat", "Web Chat"),
    ]

    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name="channels")
    kind = models.CharField(max_length=16, choices=KIND_CHOICES)
    address = models.CharField(max_length=255, help_text="phone number, email, etc.")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [("business", "kind", "address")]

    def __str__(self) -> str:
        return f"{self.business.name} · {self.kind}: {self.address}"
