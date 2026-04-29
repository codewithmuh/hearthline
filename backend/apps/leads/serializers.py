from rest_framework import serializers

from .models import Conversation, Customer, Lead, Message


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ["id", "business", "name", "phone", "email", "address", "notes", "created_at"]


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["id", "conversation", "direction", "role", "body", "media_url", "created_at"]


class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = ["id", "lead", "channel", "started_at", "last_activity_at", "messages"]


class LeadSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)
    conversations = ConversationSerializer(many=True, read_only=True)

    class Meta:
        model = Lead
        fields = [
            "id", "business", "customer", "source_channel",
            "project_summary", "status", "temperature",
            "estimated_value", "extracted_fields",
            "conversations", "created_at", "updated_at",
        ]
