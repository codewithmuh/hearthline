import secrets

from django.db import models

from apps.leads.models import Lead


def _gen_public_token() -> str:
    return secrets.token_urlsafe(24)


class Quote(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("sent", "Sent"),
        ("viewed", "Viewed"),
        ("accepted", "Accepted"),
        ("declined", "Declined"),
    ]

    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="quotes")
    reference = models.CharField(max_length=32, unique=True)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    pdf_url = models.URLField(blank=True)
    # Random unguessable token used in the public WhatsApp/SMS quote URL.
    # The reference (HL-A1F3C2) is short and human-readable but only ~16M
    # combos — too small for an open URL. This token gives ~144 bits of entropy.
    public_token = models.CharField(max_length=40, unique=True, default=_gen_public_token)
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default="draft")
    drafted_by_ai = models.BooleanField(default=True)
    # JSON metadata bucket — currently stores `drafted_during_call` (Vapi
    # call_id) so we can dedupe a draft_quote tool call across retries. Kept
    # generic so it can hold scope notes, source links, etc. Field name stays
    # as `photo_assessment` for API/data compatibility — don't rename.
    photo_assessment = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    accepted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Quote {self.reference} · {self.total} · {self.status}"


class LineItem(models.Model):
    quote = models.ForeignKey(Quote, on_delete=models.CASCADE, related_name="line_items")
    description = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=8, decimal_places=2, default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self) -> str:
        return f"{self.description} × {self.quantity}"
