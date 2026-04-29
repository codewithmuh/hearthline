from rest_framework import serializers

from .models import Business, Channel


class ChannelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Channel
        fields = ["id", "kind", "address", "is_active", "created_at"]


class BusinessSerializer(serializers.ModelSerializer):
    channels = ChannelSerializer(many=True, read_only=True)

    class Meta:
        model = Business
        fields = [
            "id", "name", "slug", "trade", "timezone",
            "phone_number", "voice_persona", "knowledge_base",
            "channels", "created_at", "updated_at",
        ]
