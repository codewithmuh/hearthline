import logging
import os

from django.conf import settings
from django.http import HttpResponse, Http404
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Quote
from .serializers import QuoteSerializer
from .services.pdf import render_quote_pdf

logger = logging.getLogger(__name__)


class QuoteList(generics.ListCreateAPIView):
    queryset = Quote.objects.all().order_by("-created_at")
    serializer_class = QuoteSerializer
    permission_classes = [IsAuthenticated]


class QuoteDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Quote.objects.all()
    serializer_class = QuoteSerializer
    permission_classes = [IsAuthenticated]


def _quote_pdf_path(quote: Quote) -> str:
    """Where the rendered PDF lives on disk inside the container.

    Mounted volume = /var/data/quotes (caller's responsibility to create).
    Falls back to the staticfiles dir for local dev.
    """
    base = getattr(settings, "QUOTE_PDF_DIR", "/var/data/quotes")
    try:
        os.makedirs(base, exist_ok=True)
    except OSError:
        # Fall back when /var/data isn't writable (e.g. local dev).
        base = os.path.join(getattr(settings, "BASE_DIR", "."), "tmp_quotes")
        os.makedirs(base, exist_ok=True)
    return os.path.join(base, f"{quote.public_token}.pdf")


def _public_quote_url(request, quote: Quote) -> str:
    """Customer-facing URL — the /q/ route is on the Django backend (API_DOMAIN).

    Use API_DOMAIN when set so the link is the public production hostname rather
    than the request host (which might be `backend:8000` for internal calls).
    """
    host = os.environ.get("API_DOMAIN", "").strip()
    if host:
        return f"https://{host}/q/{quote.public_token}"
    return request.build_absolute_uri(f"/q/{quote.public_token}")


class RenderQuotePdfView(APIView):
    """Render the quote to PDF, persist it to disk, set quote.pdf_url, return JSON."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk: int):
        quote = Quote.objects.filter(pk=pk).first()
        if quote is None:
            return Response({"detail": "Quote not found."}, status=status.HTTP_404_NOT_FOUND)
        try:
            pdf_bytes = render_quote_pdf(quote)
        except Exception as exc:  # noqa: BLE001
            logger.exception("[QUOTE PDF] render failed: %s", exc)
            return Response({"detail": f"render failed: {exc}"}, status=500)
        path = _quote_pdf_path(quote)
        with open(path, "wb") as fh:
            fh.write(pdf_bytes)
        public_url = _public_quote_url(request, quote)
        if quote.pdf_url != public_url:
            quote.pdf_url = public_url
            quote.save(update_fields=["pdf_url"])
        return Response({"ok": True, "url": public_url, "bytes": len(pdf_bytes)})


class PublicQuotePdfView(APIView):
    """Stream the rendered PDF by public_token. No auth — token is the secret."""
    permission_classes = [AllowAny]
    authentication_classes: list = []

    def get(self, request, token: str):
        quote = Quote.objects.filter(public_token=token).first()
        if quote is None:
            raise Http404
        path = _quote_pdf_path(quote)
        # If the PDF isn't on disk yet (e.g. fresh container), render on demand.
        if not os.path.exists(path):
            try:
                with open(path, "wb") as fh:
                    fh.write(render_quote_pdf(quote))
            except Exception as exc:  # noqa: BLE001
                logger.exception("[QUOTE PDF] on-demand render failed: %s", exc)
                raise Http404 from exc
        with open(path, "rb") as fh:
            data = fh.read()
        # Mark as viewed (best-effort).
        if quote.status == "sent":
            quote.status = "viewed"
            quote.save(update_fields=["status"])
        resp = HttpResponse(data, content_type="application/pdf")
        resp["Content-Disposition"] = f'inline; filename="quote-{quote.reference}.pdf"'
        return resp
