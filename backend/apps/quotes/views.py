from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.ai.services import draft_quote_from_photo
from apps.leads.models import Lead

from .models import Quote
from .serializers import QuoteSerializer


class QuoteList(generics.ListCreateAPIView):
    queryset = Quote.objects.all().order_by("-created_at")
    serializer_class = QuoteSerializer
    permission_classes = [AllowAny]


class QuoteDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Quote.objects.all()
    serializer_class = QuoteSerializer
    permission_classes = [AllowAny]


class PhotoQuote(APIView):
    """POST a photo URL + a lead id, get back an AI-drafted quote.

    The flagship Hearthline differentiator: skip the measurement visit, drive
    a real PDF estimate from a single phone photo.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        photo_url = request.data.get("photo_url")
        lead_id = request.data.get("lead_id")
        if not photo_url or not lead_id:
            return Response(
                {"error": "photo_url and lead_id are required"}, status=400
            )
        try:
            lead = Lead.objects.get(pk=lead_id)
        except Lead.DoesNotExist:
            return Response({"error": "lead not found"}, status=404)

        draft = draft_quote_from_photo(photo_url, lead=lead)
        quote = Quote.objects.create(
            lead=lead,
            reference=draft["reference"],
            subtotal=draft["subtotal"],
            tax=draft["tax"],
            total=draft["total"],
            notes=draft["notes"],
            photo_assessment=draft["photo_assessment"],
            drafted_by_ai=True,
            status="draft",
        )
        for item in draft["line_items"]:
            quote.line_items.create(**item)

        return Response(QuoteSerializer(quote).data, status=201)
