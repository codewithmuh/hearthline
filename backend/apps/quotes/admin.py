from django.contrib import admin

from .models import LineItem, Quote


class LineItemInline(admin.TabularInline):
    model = LineItem
    extra = 1


@admin.register(Quote)
class QuoteAdmin(admin.ModelAdmin):
    list_display = ("reference", "lead", "total", "status", "drafted_by_ai", "created_at")
    list_filter = ("status", "drafted_by_ai")
    search_fields = ("reference",)
    inlines = [LineItemInline]
