import math
import random
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Tournament, TournamentTeam, TournamentMatch
from .serializers import TournamentSerializer, TournamentEnrollSerializer, TournamentMatchSerializer
from .utils import tournament_notifier

class TournamentMatchViewSet(viewsets.ModelViewSet):
    queryset = TournamentMatch.objects.all()
    serializer_class = TournamentMatchSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def perform_update(self, serializer):
        instance = serializer.save()
        if instance.status == 'completed':
            # Determinar ganador
            if instance.score1 > instance.score2:
                instance.winner = instance.team1
            elif instance.score2 > instance.score1:
                instance.winner = instance.team2
            else:
                # En caso de empate en eliminación directa, el admin debe elegir el ganador
                # Si no se ha elegido (winner es None), no avanzamos
                pass
            
            instance.save()

            # Lógica de Progresión: Mover al ganador al siguiente partido
            if instance.winner and instance.next_match:
                next_m = instance.next_match
                if instance.position_in_next_match == 'team1':
                    next_m.team1 = instance.winner
                else:
                    next_m.team2 = instance.winner
                next_m.save()
                # Notificar también el siguiente partido actualizado
                tournament_notifier.notify_match_updated(next_m)
            
            # Si es la final y terminó, marcar torneo como finalizado
            if not instance.next_match and instance.round_name == "Final":
                tournament = instance.tournament
                tournament.status = 'finished'
                tournament.save()
        
        # Notificar vía WebSocket el partido actual
        tournament_notifier.notify_match_updated(instance)

class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all().order_by('-created_at')
    serializer_class = TournamentSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        cover_image_file = request.FILES.get('coverImage')
        url = None
        if cover_image_file:
            from utils.supabase_storage import supabase_storage
            url = supabase_storage.upload_image(cover_image_file, folder="tournaments")
            
        serializer.save(cover_image=url)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        cover_image_file = request.FILES.get('coverImage')
        if cover_image_file:
            from utils.supabase_storage import supabase_storage
            # Eliminar la anterior si existe
            if instance.cover_image:
                supabase_storage.delete_image(instance.cover_image)
            
            url = supabase_storage.upload_image(cover_image_file, folder="tournaments")
            serializer.save(cover_image=url)
        else:
            serializer.save()
            
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def enroll(self, request, pk=None):
        tournament = self.get_object()
        serializer = TournamentEnrollSerializer(data=request.data)
        
        if serializer.is_valid():
            # 🔥 Corrección: Usamos .count() para asegurar el número real de la base de datos
            if tournament.teams.count() >= tournament.max_teams:
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
        num_teams = len(teams)
        
        if num_teams < 2:
            return Response(
                {"error": "Se necesitan al menos 2 equipos para generar un fixture."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 1. Limpiar fixture anterior
        tournament.matches.all().delete()
        random.shuffle(teams)

        # 2. Calcular estructura del Bracket (Potencia de 2)
        num_rounds = math.ceil(math.log2(num_teams))
        bracket_size = 2**num_rounds
        
        # 3. Crear todos los partidos del bracket (desde la final hacia atrás)
        matches_by_round = {}
        
        # Nombres amigables para las rondas
        def get_round_name(r_idx, total_r):
            dist = total_r - r_idx
            if dist == 0: return "Final"
            if dist == 1: return "Semifinal"
            if dist == 2: return "Cuartos de Final"
            if dist == 3: return "Octavos de Final"
            return f"Ronda {r_idx}"

        # Crear partidos "huecos" y conectarlos
        for r in range(1, num_rounds + 1):
            matches_in_round = bracket_size // (2**r)
            matches_by_round[r] = []
            for i in range(matches_in_round):
                match = TournamentMatch.objects.create(
                    tournament=tournament,
                    round_number=r,
                    round_name=get_round_name(r, num_rounds),
                    order=i + 1,
                    status='pending'
                )
                matches_by_round[r].append(match)
                
                # Conectar con el partido de la siguiente ronda
                if r > 1:
                    prev_round_matches = matches_by_round[r-1]
                    # El partido i de la ronda r recibe a los ganadores de los partidos 2i y 2i+1 de la ronda r-1
                    m_prev1 = prev_round_matches[2*i]
                    m_prev2 = prev_round_matches[2*i+1]
                    
                    m_prev1.next_match = match
                    m_prev1.position_in_next_match = 'team1'
                    m_prev1.save()
                    
                    m_prev2.next_match = match
                    m_prev2.position_in_next_match = 'team2'
                    m_prev2.save()

        # 4. Asignar equipos a la Ronda 1 y manejar BYEs
        first_round_matches = matches_by_round[1]
        team_idx = 0
        
        # Algoritmo de distribución:
        for match in first_round_matches:
            if team_idx < num_teams:
                match.team1 = teams[team_idx]
                team_idx += 1
            
            if team_idx < num_teams:
                match.team2 = teams[team_idx]
                team_idx += 1
            
            match.save()
            
            # Si el partido tiene solo 1 equipo, es un BYE (avanza automático)
            if match.team1 and not match.team2:
                match.status = 'completed'
                match.winner = match.team1
                match.score1 = 1 # Score simbólico para BYE
                match.score2 = 0 # 🔥 Aseguramos que el equipo inexistente tenga 0 goles
                match.save()
                
                # Avanzar al ganador inmediatamente
                if match.next_match:
                    nm = match.next_match
                    if match.position_in_next_match == 'team1':
                        nm.team1 = match.winner
                    else:
                        nm.team2 = match.winner
                    nm.save()

        tournament.status = 'in_progress'
        tournament.save()
        
        return Response(
            {"message": f"Bracket de {num_rounds} rondas generado con éxito."},
            status=status.HTTP_200_OK
        )