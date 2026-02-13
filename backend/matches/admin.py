from django.contrib import admin
from .models import MatchCategory, OpenMatch, MatchParticipant

@admin.register(MatchCategory)
class MatchCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')

class MatchParticipantInline(admin.TabularInline):
    model = MatchParticipant
    extra = 1

@admin.register(OpenMatch)
class OpenMatchAdmin(admin.ModelAdmin):
    list_display = ('id', 'court', 'creator', 'category', 'start_time', 'status', 'players_needed')
    list_filter = ('status', 'category', 'court')
    search_fields = ('court__name', 'creator__username')
    inlines = [MatchParticipantInline]

@admin.register(MatchParticipant)
class MatchParticipantAdmin(admin.ModelAdmin):
    list_display = ('id', 'match', 'user', 'joined_at')
