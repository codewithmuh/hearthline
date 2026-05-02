"""Anthropic tool schema for Anna's home-service receptionist."""

from apps.core.trades import TRADE_KEYS

TOOLS = [
    {
        "name": "qualify_lead",
        "description": (
            "Capture or update the lead record for this call. Run this as soon as you have a "
            "name and project description so the human team can follow up even if the call drops. "
            "Re-run with more fields once you learn them."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "customer_name": {"type": "string"},
                "customer_phone": {"type": "string", "description": "E.164 formatted phone number"},
                "customer_email": {"type": "string"},
                "address": {"type": "string"},
                "trade": {
                    "type": "string",
                    "enum": TRADE_KEYS,
                },
                "project_summary": {"type": "string", "description": "Plain-English description of what the customer needs"},
                "urgency": {"type": "string", "enum": ["emergency", "this_week", "this_month", "planning"]},
                "estimated_value": {"type": "number", "description": "USD ballpark for the job, your honest best guess"},
                "temperature": {"type": "string", "enum": ["hot", "warm", "cold"]},
            },
            "required": ["customer_name", "project_summary"],
        },
    },
    {
        "name": "check_availability",
        "description": "Check available service slots on a given date. Returns a list of available start times.",
        "input_schema": {
            "type": "object",
            "properties": {
                "date": {"type": "string", "description": "Date in YYYY-MM-DD format"},
                "trade": {"type": "string", "description": "Trade for the visit, e.g. 'hvac'"},
            },
            "required": ["date"],
        },
    },
    {
        "name": "book_appointment",
        "description": (
            "Book a confirmed service appointment. Only call after the caller has agreed to a "
            "specific date AND time. Confirm verbally first."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "date": {"type": "string", "description": "YYYY-MM-DD"},
                "time": {"type": "string", "description": "HH:MM (24h) start time"},
                "duration_minutes": {"type": "integer", "default": 60},
                "customer_name": {"type": "string"},
                "customer_phone": {"type": "string"},
                "address": {"type": "string"},
                "trade": {"type": "string"},
                "project_summary": {"type": "string"},
                "estimated_value": {"type": "number"},
            },
            "required": ["date", "time", "customer_name", "customer_phone"],
        },
    },
    {
        "name": "draft_quote",
        "description": (
            "Draft a quote for the caller as soon as you have enough info to estimate. "
            "Call this after qualify_lead, when you've explained the price out loud. "
            "Creates a Quote record (status=draft) on the lead so the human team and the "
            "customer can see line items, subtotal, tax, and total in the dashboard. "
            "Use realistic line items based on the business knowledge base — system size × "
            "per-unit price, inverter, racking, install labor, net-metering filing, etc."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "summary": {
                    "type": "string",
                    "description": "One-paragraph plain-English description of the quoted scope.",
                },
                "line_items": {
                    "type": "array",
                    "description": "3–6 line items. Use prices from the knowledge base.",
                    "items": {
                        "type": "object",
                        "properties": {
                            "description": {"type": "string"},
                            "quantity": {"type": "number"},
                            "unit_price": {"type": "number", "description": "In the business currency"},
                        },
                        "required": ["description", "quantity", "unit_price"],
                    },
                },
                "tax_rate": {
                    "type": "number",
                    "description": "Decimal tax rate, e.g. 0.08 for 8%. Defaults to 0 if omitted.",
                },
                "notes": {"type": "string", "description": "Customer-facing note explaining assumptions."},
                "currency": {"type": "string", "description": "ISO code, e.g. PKR, USD, EUR. Defaults to USD."},
            },
            "required": ["summary", "line_items"],
        },
    },
    {
        "name": "send_sms",
        "description": (
            "Send an SMS to the caller. ONLY call this when the caller has explicitly "
            "asked for an SMS confirmation. Do NOT auto-send. If caller said 'no SMS' "
            "or wants email only, skip this tool entirely."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "to": {"type": "string", "description": "E.164 phone number"},
                "message": {"type": "string", "description": "SMS body, max 320 chars"},
            },
            "required": ["to", "message"],
        },
    },
    {
        "name": "send_email",
        "description": (
            "Send an email to the caller. ONLY call this when the caller has explicitly "
            "asked for an email confirmation AND has given you their email address. Do NOT "
            "auto-send. If caller said 'no email' or wants SMS only, skip this tool entirely."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "to": {"type": "string", "description": "Recipient email address"},
                "subject": {"type": "string", "description": "Email subject line"},
                "body": {"type": "string", "description": "Plain-text email body"},
            },
            "required": ["to", "subject", "body"],
        },
    },
    {
        "name": "end_call",
        "description": "Hang up the call. Use this after you have said goodbye, or after a second silence.",
        "input_schema": {
            "type": "object",
            "properties": {
                "reason": {"type": "string", "description": "Short reason for hanging up — booking_complete, caller_silent, transfer_to_human, etc."},
            },
            "required": ["reason"],
        },
    },
]
