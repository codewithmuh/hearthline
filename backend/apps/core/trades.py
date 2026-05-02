"""Canonical trade taxonomy for Hearthline.

Imported by both the Business model (`choices`) and the agent tool schema
so Anna can never extract a trade the data model can't represent.
"""

TRADES: list[tuple[str, str]] = [
    ("hvac", "HVAC & Plumbing"),
    ("plumbing", "Plumbing"),
    ("windows", "Windows & Doors"),
    ("roofing", "Roofing"),
    ("solar", "Solar"),
    ("renovation", "Energy Renovation"),
    ("electrical", "Electrical"),
    ("garage", "Garage Doors"),
    ("landscaping", "Landscaping"),
    ("cleaning", "Cleaning"),
    ("pest", "Pest Control"),
    ("general", "General Contractor"),
]

TRADE_KEYS: list[str] = [k for k, _ in TRADES]
