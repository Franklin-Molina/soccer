from django.contrib import admin
from .models import ChatMessage

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'match', 'user', 'message', 'created_at')
    list_filter = ('match', 'user', 'created_at')
    search_fields = ('message', 'user__username')
    readonly_fields = ('created_at',)
