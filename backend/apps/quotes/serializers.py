from rest_framework import serializers

from .models import LineItem, Quote


class LineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = LineItem
        fields = ["id", "description", "quantity", "unit_price", "total"]


class QuoteSerializer(serializers.ModelSerializer):
    line_items = LineItemSerializer(many=True, read_only=True)

    class Meta:
        model = Quote
        fields = [
            "id", "lead", "reference", "subtotal", "tax", "total",
            "notes", "pdf_url", "status", "drafted_by_ai", "photo_assessment",
            "line_items", "created_at", "sent_at", "accepted_at",
        ]
