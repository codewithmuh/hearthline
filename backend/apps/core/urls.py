from django.urls import path

from . import views

urlpatterns = [
    path("businesses/", views.BusinessListCreate.as_view(), name="business-list"),
    path("businesses/<int:pk>/", views.BusinessDetail.as_view(), name="business-detail"),
]
