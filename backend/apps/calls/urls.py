from django.urls import path

from . import views

urlpatterns = [
    path("", views.CallList.as_view(), name="call-list"),
    path("webhooks/vapi/", views.VapiWebhook.as_view(), name="vapi-webhook"),
    path("webhooks/twilio/", views.TwilioWebhook.as_view(), name="twilio-webhook"),
]
