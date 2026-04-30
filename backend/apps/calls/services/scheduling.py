"""Stub scheduling service. Replace with Google Calendar / ServiceTitan / Jobber later."""
from datetime import datetime, timedelta

# Default service hours: 8 AM – 6 PM weekdays, 9 AM – 2 PM Saturdays, closed Sundays
DEFAULT_DAILY_SLOTS_WEEKDAY = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"]
DEFAULT_DAILY_SLOTS_SATURDAY = ["09:00", "10:00", "11:00", "12:00", "13:00"]


def check_availability(date_str: str, trade: str | None = None) -> dict:
    """Return available start times for a given date.

    For now this is a stub that pretends every weekday is open and removes a
    pseudo-random subset to simulate other booked appointments. Wire this to
    your real calendar provider in production.
    """
    try:
        date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return {"available": [], "error": f"Invalid date format: {date_str}. Use YYYY-MM-DD."}

    # Closed Sunday
    if date.weekday() == 6:
        return {"date": date_str, "available": [], "note": "Closed Sundays."}

    # Saturday is shorter
    if date.weekday() == 5:
        slots = list(DEFAULT_DAILY_SLOTS_SATURDAY)
    else:
        slots = list(DEFAULT_DAILY_SLOTS_WEEKDAY)

    # Stub: drop a deterministic subset by date hash so it feels realistic
    h = sum(map(ord, date_str)) % 4
    booked_idx = {h, (h + 3) % len(slots)}
    available = [s for i, s in enumerate(slots) if i not in booked_idx]
    return {"date": date_str, "available": available, "trade": trade}


def parse_when(date_str: str, time_str: str) -> datetime | None:
    """Parse a (date, time) pair into a datetime. Used for booking validation."""
    try:
        return datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
    except ValueError:
        try:
            return datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %I:%M %p")
        except ValueError:
            return None


def humanize_when(when: datetime) -> str:
    return when.strftime("%A %B %d at %I:%M %p")


def end_of_window(when: datetime, duration_minutes: int = 60) -> datetime:
    return when + timedelta(minutes=duration_minutes)
