from django.contrib import admin

from .models import Business, Channel


@admin.register(Business)
class BusinessAdmin(admin.ModelAdmin):
    list_display = ("name", "trade", "phone_number", "voice_persona", "created_at")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Channel)
class ChannelAdmin(admin.ModelAdmin):
    list_display = ("business", "kind", "address", "is_active")
    list_filter = ("kind", "is_active")
