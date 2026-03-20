from rest_framework import serializers
from .models import Tournament, TournamentTeam, TournamentMatch
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']

class TournamentTeamSerializer(serializers.ModelSerializer):
    captain = UserSimpleSerializer(read_only=True)
    
    class Meta:
        model = TournamentTeam
        fields = ['id', 'name', 'captain', 'payment_status', 'created_at']

class TournamentMatchSerializer(serializers.ModelSerializer):
    team1 = TournamentTeamSerializer(read_only=True)
    team2 = TournamentTeamSerializer(read_only=True)
    winner = TournamentTeamSerializer(read_only=True)

    class Meta:
        model = TournamentMatch
        fields = [
            'id', 'team1', 'team2', 'score1', 'score2', 
            'date', 'location', 'round_number', 'round_name', 'order', 
            'status', 'winner', 'next_match', 'position_in_next_match'
        ]

class TournamentSerializer(serializers.ModelSerializer):
    startDate = serializers.DateField(source='start_date')
    endDate = serializers.DateField(source='end_date')
    registeredTeams = serializers.ReadOnlyField(source='registered_teams_count')
    maxTeams = serializers.IntegerField(source='max_teams')
    coverImage = serializers.URLField(source='cover_image', read_only=True)
    registrationFee = serializers.DecimalField(source='registration_fee', max_digits=10, decimal_places=2)
    teams = TournamentTeamSerializer(many=True, read_only=True)
    matches = TournamentMatchSerializer(many=True, read_only=True)

    class Meta:
        model = Tournament
        fields = [
            'id', 'name', 'description', 'startDate', 'endDate', 
            'location', 'prize', 'level', 'format', 'registrationFee', 
            'maxTeams', 'status', 'coverImage', 'registeredTeams',
            'teams', 'matches', 'created_at'
        ]

class TournamentEnrollSerializer(serializers.Serializer):
    team_name = serializers.CharField(max_length=100)
