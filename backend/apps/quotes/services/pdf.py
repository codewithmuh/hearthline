"""Server-rendered PDF for a Quote.

Pure ReportLab so we don't need WeasyPrint's system-level dependencies on the
container. The output isn't a designer-grade invoice — it's a clean,
business-name-on-top, line-items-table, totals-on-the-bottom estimate that
the customer can open from a WhatsApp link.
"""
from __future__ import annotations

from decimal import Decimal
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from apps.quotes.models import Quote


CURRENCY_SYMBOL = {
    "USD": "$", "CAD": "C$", "AUD": "A$", "NZD": "NZ$",
    "EUR": "€", "GBP": "£", "CHF": "CHF",
    "PKR": "Rs", "INR": "₹", "BDT": "৳", "LKR": "Rs", "NPR": "Rs",
    "AED": "AED", "SAR": "SAR", "QAR": "QAR", "KWD": "KWD", "BHD": "BHD",
    "OMR": "OMR", "JOD": "JOD", "EGP": "E£", "ILS": "₪",
    "ZAR": "R", "NGN": "₦", "KES": "KSh", "GHS": "₵",
    "CNY": "¥", "HKD": "HK$", "TWD": "NT$", "JPY": "¥", "KRW": "₩",
    "SGD": "S$", "MYR": "RM", "IDR": "Rp", "PHP": "₱", "THB": "฿", "VND": "₫",
    "MXN": "$", "BRL": "R$", "ARS": "$", "CLP": "$", "COP": "$", "PEN": "S/.",
    "TRY": "₺", "RUB": "₽", "UAH": "₴", "PLN": "zł", "CZK": "Kč",
    "HUF": "Ft", "RON": "lei", "SEK": "kr", "NOK": "kr", "DKK": "kr",
}


def _fmt_money(amount: Decimal | float | int, currency: str) -> str:
    sym = CURRENCY_SYMBOL.get(currency.upper(), currency.upper() + " ")
    n = Decimal(str(amount or 0))
    # Two-decimal format with thousands separators.
    return f"{sym}{n:,.2f}"


def render_quote_pdf(quote: Quote) -> bytes:
    """Render a Quote into a ReportLab PDF and return the bytes."""
    business = getattr(quote.lead, "business", None)
    business_name = getattr(business, "name", "") or "Hearthline"
    business_phone = getattr(business, "phone_number", "") or ""
    currency = (getattr(business, "currency", "") or "USD").upper()

    customer = getattr(quote.lead, "customer", None)
    customer_name = getattr(customer, "name", "") or "Customer"
    customer_phone = getattr(customer, "phone", "") or ""
    customer_address = getattr(customer, "address", "") or ""

    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=18 * mm, rightMargin=18 * mm,
        topMargin=20 * mm, bottomMargin=20 * mm,
        title=f"Quote {quote.reference}",
        author=business_name,
    )

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="HL_Title", fontName="Helvetica-Bold",
                              fontSize=22, leading=26, textColor=colors.HexColor("#0c2541")))
    styles.add(ParagraphStyle(name="HL_Sub", fontName="Helvetica",
                              fontSize=10.5, textColor=colors.HexColor("#5b6b80")))
    styles.add(ParagraphStyle(name="HL_Section", fontName="Helvetica-Bold",
                              fontSize=11, leading=14, textColor=colors.HexColor("#0c2541"),
                              spaceBefore=8, spaceAfter=4))
    styles.add(ParagraphStyle(name="HL_Body", fontName="Helvetica",
                              fontSize=10, leading=14, textColor=colors.HexColor("#1f2937")))
    styles.add(ParagraphStyle(name="HL_Foot", fontName="Helvetica",
                              fontSize=8.5, leading=11, textColor=colors.HexColor("#7280a0"),
                              alignment=1))

    story: list = []

    # --- Header ---
    story.append(Paragraph(business_name, styles["HL_Title"]))
    if business_phone:
        story.append(Paragraph(business_phone, styles["HL_Sub"]))
    story.append(Spacer(1, 8 * mm))

    # --- Quote meta + customer (two columns) ---
    meta_left = (
        f"<b>Estimate</b><br/>"
        f"Reference: <b>{quote.reference}</b><br/>"
        f"Status: {quote.get_status_display()}<br/>"
        f"Issued: {quote.created_at.strftime('%B %d, %Y') if quote.created_at else ''}"
    )
    meta_right = (
        f"<b>For</b><br/>"
        f"{customer_name}<br/>"
        f"{customer_phone}<br/>"
        f"{customer_address}"
    )
    meta_table = Table(
        [[Paragraph(meta_left, styles["HL_Body"]), Paragraph(meta_right, styles["HL_Body"])]],
        colWidths=[88 * mm, 86 * mm],
    )
    meta_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 8 * mm))

    # --- Line items ---
    rows = [["Description", "Qty", "Unit", "Amount"]]
    for item in quote.line_items.all():
        rows.append([
            Paragraph(item.description or "", styles["HL_Body"]),
            f"{item.quantity:g}",
            _fmt_money(item.unit_price, currency),
            _fmt_money(item.total, currency),
        ])
    items_table = Table(rows, colWidths=[100 * mm, 16 * mm, 28 * mm, 30 * mm], repeatRows=1)
    items_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0c2541")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 10),
        ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
        ("ALIGN", (0, 0), (0, -1), "LEFT"),
        ("FONTSIZE", (0, 1), (-1, -1), 10),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f7f8fb")]),
        ("LINEBELOW", (0, 0), (-1, 0), 0.6, colors.HexColor("#0c2541")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(items_table)
    story.append(Spacer(1, 6 * mm))

    # --- Totals (right-aligned) ---
    totals_rows = [
        ["Subtotal", _fmt_money(quote.subtotal, currency)],
        ["Tax", _fmt_money(quote.tax, currency)],
        ["Total", _fmt_money(quote.total, currency)],
    ]
    totals_table = Table(totals_rows, colWidths=[44 * mm, 30 * mm], hAlign="RIGHT")
    totals_table.setStyle(TableStyle([
        ("ALIGN", (0, 0), (-1, -1), "RIGHT"),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10.5),
        ("LINEABOVE", (0, -1), (-1, -1), 0.6, colors.HexColor("#0c2541")),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(totals_table)
    story.append(Spacer(1, 8 * mm))

    # --- Notes ---
    if quote.notes:
        story.append(Paragraph("Notes", styles["HL_Section"]))
        story.append(Paragraph(quote.notes.replace("\n", "<br/>"), styles["HL_Body"]))
        story.append(Spacer(1, 4 * mm))

    # --- Footer ---
    story.append(Spacer(1, 6 * mm))
    story.append(Paragraph(
        f"This estimate is valid for 14 days. Generated by {business_name} via Hearthline.",
        styles["HL_Foot"],
    ))

    doc.build(story)
    return buf.getvalue()
