from django.db import models

from apps.core.models import Business, Channel


class Customer(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name="customers")
    name = models.CharField(max_length=200, blank=True)
    phone = models.CharField(max_length=32, blank=True, db_index=True)
    email = models.EmailField(blank=True, db_index=True)
    address = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["business", "phone"])]

    def __str__(self) -> str:
        return self.name or self.phone or self.email or f"Customer #{self.pk}"


class Lead(models.Model):
    """A potential job. Created the moment a customer touches any channel."""

    STATUS_CHOICES = [
        ("new", "New"),
        ("qualifying", "Qualifying"),
        ("quoted", "Quoted"),
        ("booked", "Booked"),
        ("won", "Won"),
        ("lost", "Lost"),
    ]
    TEMPERATURE_CHOICES = [
        ("hot", "Hot"),
        ("warm", "Warm"),
        ("cold", "Cold"),
    ]

    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name="leads")
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="leads")
    source_channel = models.ForeignKey(Channel, on_delete=models.SET_NULL, null=True, blank=True)
    project_summary = models.CharField(max_length=512, blank=True)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="new")
    temperature = models.CharField(max_length=8, choices=TEMPERATURE_CHOICES, default="warm")
    estimated_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    extracted_fields = models.JSONField(
        default=dict, blank=True,
        help_text="Structured data the LLM pulled from the conversation",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["business", "-created_at"])]

    def __str__(self) -> str:
        return f"Lead #{self.pk} · {self.customer} · {self.status}"


class Conversation(models.Model):
    """A thread of messages on one channel for one lead."""

    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="conversations")
    channel = models.ForeignKey(Channel, on_delete=models.SET_NULL, null=True, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    last_activity_at = models.DateTimeField(auto_now=True)


class Message(models.Model):
    DIRECTION_CHOICES = [("in", "Inbound"), ("out", "Outbound")]
    ROLE_CHOICES = [
        ("customer", "Customer"),
        ("ai", "AI"),
        ("agent", "Human Agent"),
        ("system", "System"),
    ]

    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name="messages"
    )
    direction = models.CharField(max_length=4, choices=DIRECTION_CHOICES)
    role = models.CharField(max_length=12, choices=ROLE_CHOICES)
    body = models.TextField()
    media_url = models.URLField(blank=True, help_text="Photo, audio, or doc the customer sent")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
