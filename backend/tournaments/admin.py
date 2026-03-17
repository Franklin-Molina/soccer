from django.contrib import admin
from .models import Tournament, TournamentTeam, TournamentMatch

class TournamentMatchInline(admin.TabularInline):
    model = TournamentMatch
    extra = 1

class TournamentTeamInline(admin.TabularInline):
    model = TournamentTeam
    extra = 1

@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    list_display = ('name', 'status', 'start_date', 'end_date', 'registered_teams_count', 'max_teams')
    list_filter = ('status', 'start_date')
    search_fields = ('name', 'description')
    inlines = [TournamentTeamInline, TournamentMatchInline]

@admin.register(TournamentTeam)
class TournamentTeamAdmin(admin.ModelAdmin):
    list_display = ('name', 'tournament', 'captain', 'payment_status', 'created_at')
    list_filter = ('payment_status', 'tournament')
    search_fields = ('name', 'captain__username')

@admin.register(TournamentMatch)
class TournamentMatchAdmin(admin.ModelAdmin):
    list_display = ('tournament', 'team1', 'team2', 'round_name', 'status', 'winner')
    list_filter = ('tournament', 'round_name', 'status')
