"""AI service layer.

Two pipelines:
  1. extract_lead_from_transcript — turns a call transcript into structured lead data.
  2. draft_quote_from_photo       — Hearthline's flagship feature: a single customer
                                    photo → a real PDF-ready quote in <60s.

Both use Anthropic Claude as the orchestrator. For vision, we route to OpenAI
when the image is hosted somewhere Anthropic can't fetch directly (cheap model
fallback). The interfaces below are stable; swap providers freely.
"""
from __future__ import annotations

import json
import logging
import secrets
from decimal import Decimal
from typing import Any

from django.conf import settings

logger = logging.getLogger(__name__)


CLAUDE_MODEL = "claude-sonnet-4-6"
OPENAI_VISION_MODEL = "gpt-4o-mini"


def _claude_client():
    if not settings.ANTHROPIC_API_KEY:
        return None
    try:
        import anthropic  # noqa: WPS433
    except ImportError:
        logger.warning("anthropic SDK not installed")
        return None
    return anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)


def _openai_client():
    if not settings.OPENAI_API_KEY:
        return None
    try:
        import openai  # noqa: WPS433
    except ImportError:
        logger.warning("openai SDK not installed")
        return None
    return openai.OpenAI(api_key=settings.OPENAI_API_KEY)


# ---------------------------------------------------------------------------
# 1. Transcript → structured lead
# ---------------------------------------------------------------------------

EXTRACTION_PROMPT = """You are the operations assistant for a home-services business.
Read the call transcript and return a strict JSON object with these keys:

  customer_name      string (best guess, "" if unknown)
  customer_email     string ("" if not given)
  address            string ("" if not given)
  project_summary    string, ≤ 280 chars, plain English
  trade              one of: hvac, plumbing, windows, doors, roofing, solar, renovation, other
  urgency            one of: emergency, this_week, this_month, planning
  temperature        one of: hot, warm, cold
  estimated_value    number, USD, your best honest guess based on the work described, or null
  follow_up_actions  array of strings, max 3 items

Return ONLY the JSON object. No prose, no code fences."""


def extract_lead_from_transcript(transcript: str, business=None) -> dict[str, Any]:
    """Run Claude over the transcript and return structured lead data.

    Falls back to an empty stub when no API key is configured so the rest of
    the pipeline keeps working in local dev.
    """
    if not transcript.strip():
        return _empty_extract()

    client = _claude_client()
    if not client:
        logger.info("ANTHROPIC_API_KEY missing — returning stub lead extract")
        return _empty_extract()

    kb = (business.knowledge_base if business else "") or ""
    system = EXTRACTION_PROMPT
    if kb:
        system += "\n\nBusiness knowledge base:\n" + kb[:4000]

    msg = client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=1024,
        system=system,
        messages=[{"role": "user", "content": transcript[:16000]}],
    )

    text = "".join(block.text for block in msg.content if hasattr(block, "text"))
    try:
        return json.loads(_strip_fences(text))
    except json.JSONDecodeError:
        logger.warning("Claude returned non-JSON: %s", text[:200])
        return _empty_extract()


def _empty_extract() -> dict[str, Any]:
    return {
        "customer_name": "",
        "customer_email": "",
        "address": "",
        "project_summary": "",
        "trade": "other",
        "urgency": "planning",
        "temperature": "warm",
        "estimated_value": None,
        "follow_up_actions": [],
    }


# ---------------------------------------------------------------------------
# 2. Photo → quote (Hearthline's flagship)
# ---------------------------------------------------------------------------

PHOTO_QUOTE_PROMPT = """You are an estimator for a home-services business.
You are looking at one or more customer-supplied photos.

Step 1 — Vision analysis. Identify what's in the photo: trade (hvac/plumbing/windows/
doors/roofing/solar/renovation), the specific job or fault, approximate scope
(units, square footage, severity), and any concerns visible.

Step 2 — Quote draft. Produce a JSON object with these keys:

  trade            string
  scope_summary    one-paragraph plain-English description of the scope
  line_items       array of {description, quantity, unit_price, total}
                   3–6 items, realistic US market prices
  subtotal         number
  tax              number (8% of subtotal)
  total            number (subtotal + tax)
  notes            short customer-facing note explaining the assumptions
  caveats          array of short strings — what would change the price after a site visit

Return ONLY the JSON. No prose, no code fences."""


def draft_quote_from_photo(photo_url: str, lead=None) -> dict[str, Any]:
    """Take a photo URL → a structured quote draft."""
    raw = _vision_quote(photo_url)
    if not raw:
        # Stub so endpoint stays usable when no API key is set
        raw = _stub_quote()

    line_items = []
    subtotal = Decimal("0")
    for item in raw.get("line_items", []):
        qty = Decimal(str(item.get("quantity", 1)))
        unit = Decimal(str(item.get("unit_price", 0)))
        total = (qty * unit).quantize(Decimal("0.01"))
        line_items.append({
            "description": item.get("description", "")[:255],
            "quantity": qty,
            "unit_price": unit,
            "total": total,
        })
        subtotal += total
    tax = (subtotal * Decimal("0.08")).quantize(Decimal("0.01"))
    total = subtotal + tax

    return {
        "reference": _generate_reference(),
        "subtotal": subtotal,
        "tax": tax,
        "total": total,
        "notes": raw.get("notes", "")[:1000],
        "line_items": line_items,
        "photo_assessment": {
            "trade": raw.get("trade"),
            "scope_summary": raw.get("scope_summary"),
            "caveats": raw.get("caveats", []),
            "source_photo": photo_url,
        },
    }


def _vision_quote(photo_url: str) -> dict[str, Any] | None:
    client = _openai_client()
    if not client:
        return None
    try:
        resp = client.chat.completions.create(
            model=OPENAI_VISION_MODEL,
            messages=[
                {"role": "system", "content": PHOTO_QUOTE_PROMPT},
                {"role": "user", "content": [
                    {"type": "text", "text": "Draft the quote for this photo."},
                    {"type": "image_url", "image_url": {"url": photo_url}},
                ]},
            ],
            max_tokens=1200,
            response_format={"type": "json_object"},
        )
        content = resp.choices[0].message.content or ""
        return json.loads(_strip_fences(content))
    except Exception as exc:  # noqa: BLE001
        logger.warning("vision quote failed: %s", exc)
        return None


def _stub_quote() -> dict[str, Any]:
    return {
        "trade": "windows",
        "scope_summary": "(stub — no AI keys configured) replace 5 standard PVC windows.",
        "line_items": [
            {"description": "Standard PVC window (1.2m × 1.4m)", "quantity": 5, "unit_price": 580},
            {"description": "Removal & disposal of existing units", "quantity": 5, "unit_price": 120},
            {"description": "Site survey + measurement", "quantity": 1, "unit_price": 150},
        ],
        "notes": "Prices indicative pending in-person measurement. Includes labour and materials.",
        "caveats": [
            "Price assumes standard sizing; bespoke openings will be re-quoted.",
            "Excludes interior trim repaint.",
        ],
    }


# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------

def _strip_fences(text: str) -> str:
    t = text.strip()
    if t.startswith("```"):
        t = t.lstrip("`")
        # drop optional language tag like "json"
        if "\n" in t:
            t = t.split("\n", 1)[1]
        if t.endswith("```"):
            t = t[:-3]
    return t.strip()


def _generate_reference() -> str:
    return "HL-" + secrets.token_hex(3).upper()
