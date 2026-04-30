"""Anthropic tool schema for Anna's home-service receptionist."""

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
                    "enum": ["hvac", "plumbing", "windows", "doors", "roofing", "solar", "renovation", "electrical", "garage", "pest", "cleaning", "other"],
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
        "name": "send_sms",
        "description": "Send an SMS confirmation to the caller. Run this in the background after a successful booking.",
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
