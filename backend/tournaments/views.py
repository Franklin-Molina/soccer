from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Tournament, TournamentTeam, TournamentMatch
from .serializers import TournamentSerializer, TournamentEnrollSerializer
import random

class TournamentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tournament.objects.all().order_by('-created_at')
    serializer_class = TournamentSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def enroll(self, request, pk=None):
        tournament = self.get_object()
        serializer = TournamentEnrollSerializer(data=request.data)
        
        if serializer.is_valid():
            if tournament.registered_teams_count >= tournament.max_teams:
                return Response(
                    {"error": "El torneo ya ha alcanzado el máximo de equipos."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if TournamentTeam.objects.filter(tournament=tournament, captain=request.user).exists():
                return Response(
                    {"error": "Ya has inscrito un equipo en este torneo."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            team_name = serializer.validated_data['team_name']
            
            team = TournamentTeam.objects.create(
                tournament=tournament,
                name=team_name,
                captain=request.user
            )
            
            return Response(
                {"message": f"Equipo '{team_name}' inscrito correctamente. Pendiente de pago.", "team_id": team.id},
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def generate_fixture(self, request, pk=None):
        tournament = self.get_object()
        teams = list(tournament.teams.all())
        
        if len(teams) < 2:
            return Response(
                {"error": "Se necesitan al menos 2 equipos para generar un fixture."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Eliminar partidos existentes
        tournament.matches.all().delete()
        
        # Mezclar equipos
        random.shuffle(teams)
        
        matches_created = 0
        for i in range(0, len(teams), 2):
            if i + 1 < len(teams):
                TournamentMatch.objects.create(
                    tournament=tournament,
                    team1=teams[i],
                    team2=teams[i+1],
                    round_name="Primera Ronda",
                    order=matches_created + 1
                )
                matches_created += 1
            else:
                TournamentMatch.objects.create(
                    tournament=tournament,
                    team1=teams[i],
                    team2=None,
                    round_name="Primera Ronda",
                    order=matches_created + 1,
                    status='completed',
                    winner=teams[i],
                    score1=1,
                    score2=0
                )
                matches_created += 1
        
        tournament.status = 'in_progress'
        tournament.save()
        
        return Response(
            {"message": f"Fixture generado con éxito. {matches_created} partidos creados."},
            status=status.HTTP_200_OK
        )
