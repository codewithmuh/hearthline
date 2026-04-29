from rest_framework import serializers

from .models import Call


class CallSerializer(serializers.ModelSerializer):
    class Meta:
        model = Call
        fields = [
            "id", "business", "lead", "provider", "provider_call_id",
            "from_number", "to_number", "status", "duration_seconds",
            "recording_url", "transcript", "summary",
            "started_at", "ended_at",
        ]
