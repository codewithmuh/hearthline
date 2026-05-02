from django.urls import path

from . import views

urlpatterns = [
    path("", views.LeadList.as_view(), name="lead-list"),
    path("bulk-delete/", views.bulk_delete_leads, name="lead-bulk-delete"),
    path("<int:pk>/", views.LeadDetail.as_view(), name="lead-detail"),
]
