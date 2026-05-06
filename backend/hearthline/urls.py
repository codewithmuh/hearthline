from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path

from apps.quotes.views import PublicQuotePdfView


def health(_request):
    return JsonResponse({"status": "ok", "service": "hearthline"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health),
    path("api/", include("apps.core.urls")),
    path("api/leads/", include("apps.leads.urls")),
    path("api/calls/", include("apps.calls.urls")),
    path("api/quotes/", include("apps.quotes.urls")),
    path("api/support/", include("apps.support.urls")),
    # Customer-facing quote PDF — no auth, token in URL is the secret.
    path("q/<str:token>", PublicQuotePdfView.as_view(), name="public-quote-pdf"),
]
