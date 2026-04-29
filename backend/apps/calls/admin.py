from django.contrib import admin

from .models import Call


@admin.register(Call)
class CallAdmin(admin.ModelAdmin):
    list_display = (
        "id", "provider", "status", "from_number", "to_number",
        "duration_seconds", "started_at",
    )
    list_filter = ("provider", "status")
    search_fields = ("provider_call_id", "from_number", "to_number", "transcript")
    readonly_fields = ("raw_payload",)
