from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import Business
from .serializers import BusinessSerializer


class BusinessListCreate(generics.ListCreateAPIView):
    queryset = Business.objects.all().order_by("-created_at")
    serializer_class = BusinessSerializer
    permission_classes = [AllowAny]  # tighten before prod


class BusinessDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Business.objects.all()
    serializer_class = BusinessSerializer
    permission_classes = [AllowAny]
