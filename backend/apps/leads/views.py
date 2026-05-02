from rest_framework import filters, generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Lead
from .serializers import LeadSerializer


class LeadList(generics.ListCreateAPIView):
    queryset = Lead.objects.all().select_related("customer", "business").order_by("-created_at")
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ["project_summary", "customer__name", "customer__phone"]


class LeadDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Lead.objects.all().select_related("customer", "business")
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticated]


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def bulk_delete_leads(request):
    """Delete a set of leads by id, or all leads when {"all": true}.

    Body: {"ids": [1, 2, 3]} or {"all": true}
    """
    if request.data.get("all") is True:
        deleted, _ = Lead.objects.all().delete()
        return Response({"deleted": deleted})
    ids = request.data.get("ids") or []
    if not isinstance(ids, list) or not all(isinstance(i, int) for i in ids):
        return Response({"error": "ids must be a list of integers"}, status=status.HTTP_400_BAD_REQUEST)
    if not ids:
        return Response({"deleted": 0})
    deleted, _ = Lead.objects.filter(id__in=ids).delete()
    return Response({"deleted": deleted})
