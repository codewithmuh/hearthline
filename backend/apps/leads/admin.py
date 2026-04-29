from django.contrib import admin

from .models import Conversation, Customer, Lead, Message


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("name", "phone", "email", "business", "created_at")
    search_fields = ("name", "phone", "email")
    list_filter = ("business",)


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = (
        "id", "customer", "status", "temperature",
        "estimated_value", "project_summary", "created_at",
    )
    list_filter = ("status", "temperature", "business")
    search_fields = ("project_summary", "customer__name")


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ("id", "lead", "channel", "started_at", "last_activity_at")


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("id", "conversation", "direction", "role", "created_at")
    list_filter = ("direction", "role")
    search_fields = ("body",)
