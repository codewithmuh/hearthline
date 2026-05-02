from django.urls import path

from . import views

urlpatterns = [
    path("", views.CallList.as_view(), name="call-list"),
    path("webhooks/vapi/", views.VapiWebhook.as_view(), name="vapi-webhook"),
    path("webhooks/twilio/", views.TwilioWebhook.as_view(), name="twilio-webhook"),
    # Vapi custom-LLM mode hits this on every conversation turn.
    # Some Vapi versions append /chat/completions, others don't — register both forms.
    path("vapi/chat/completions/", views.chat_completions, name="vapi-chat-completions"),
    path("vapi/chat/completions", views.chat_completions, name="vapi-chat-completions-noslash"),
    path("vapi/", views.chat_completions, name="vapi-chat-completions-bare"),
    path("vapi", views.chat_completions, name="vapi-chat-completions-bare-noslash"),
]
