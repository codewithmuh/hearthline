from decimal import Decimal
import secrets

from rest_framework import serializers

from .models import LineItem, Quote


class LineItemSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = LineItem
        fields = ["id", "description", "quantity", "unit_price", "total"]
        extra_kwargs = {"total": {"required": False}}

    def validate(self, attrs):
        qty = Decimal(str(attrs.get("quantity", 1)))
        unit = Decimal(str(attrs.get("unit_price", 0)))
        attrs["total"] = (qty * unit).quantize(Decimal("0.01"))
        return attrs


class QuoteSerializer(serializers.ModelSerializer):
    line_items = LineItemSerializer(many=True)
    reference = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Quote
        fields = [
            "id", "lead", "reference", "subtotal", "tax", "total",
            "notes", "pdf_url", "status", "drafted_by_ai", "photo_assessment",
            "line_items", "created_at", "sent_at", "accepted_at",
        ]
        read_only_fields = ["subtotal", "tax", "total", "created_at"]

    def create(self, validated_data):
        items_data = validated_data.pop("line_items", [])
        if not validated_data.get("reference"):
            validated_data["reference"] = self._generate_reference()
        quote = Quote.objects.create(**validated_data)
        for item in items_data:
            item.pop("id", None)
            LineItem.objects.create(quote=quote, **item)
        self._recalc(quote)
        return quote

    def update(self, instance, validated_data):
        items_data = validated_data.pop("line_items", None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        if items_data is not None:
            # Replace strategy — simpler than diffing for this use case
            instance.line_items.all().delete()
            for item in items_data:
                item.pop("id", None)
                LineItem.objects.create(quote=instance, **item)
        self._recalc(instance)
        return instance

    @staticmethod
    def _recalc(quote: Quote) -> None:
        subtotal = sum((li.total for li in quote.line_items.all()), Decimal("0"))
        tax = (subtotal * Decimal("0.08")).quantize(Decimal("0.01"))
        quote.subtotal = subtotal
        quote.tax = tax
        quote.total = subtotal + tax
        quote.save(update_fields=["subtotal", "tax", "total"])

    @staticmethod
    def _generate_reference() -> str:
        return "HL-" + secrets.token_hex(3).upper()
