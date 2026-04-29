from rest_framework import filters, generics
from rest_framework.permissions import AllowAny

from .models import Lead
from .serializers import LeadSerializer


class LeadList(generics.ListCreateAPIView):
    queryset = Lead.objects.all().select_related("customer", "business").order_by("-created_at")
    serializer_class = LeadSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ["project_summary", "customer__name", "customer__phone"]


class LeadDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Lead.objects.all().select_related("customer", "business")
    serializer_class = LeadSerializer
    permission_classes = [AllowAny]
