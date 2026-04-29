from django.urls import path

from . import views

urlpatterns = [
    path("", views.LeadList.as_view(), name="lead-list"),
    path("<int:pk>/", views.LeadDetail.as_view(), name="lead-detail"),
]
