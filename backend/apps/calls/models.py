from django.db import models

from apps.core.models import Business
from apps.leads.models import Lead


class Call(models.Model):
    PROVIDER_CHOICES = [("vapi", "Vapi"), ("twilio", "Twilio")]
    STATUS_CHOICES = [
        ("ringing", "Ringing"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("failed", "Failed"),
        ("no_answer", "No Answer"),
    ]

    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name="calls")
    lead = models.ForeignKey(Lead, on_delete=models.SET_NULL, null=True, blank=True, related_name="calls")
    provider = models.CharField(max_length=16, choices=PROVIDER_CHOICES)
    provider_call_id = models.CharField(max_length=128, db_index=True)
    from_number = models.CharField(max_length=32, blank=True)
    to_number = models.CharField(max_length=32, blank=True)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="ringing")
    duration_seconds = models.PositiveIntegerField(null=True, blank=True)
    recording_url = models.URLField(blank=True)
    transcript = models.TextField(blank=True)
    summary = models.TextField(blank=True)
    raw_payload = models.JSONField(default=dict, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-started_at"]

    def __str__(self) -> str:
        return f"Call {self.provider_call_id} ({self.status})"
