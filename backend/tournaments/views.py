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

        # 2. Calcular estructura inteligente (Ronda Preliminar vs Potencia de 2)
        # Encontramos la potencia de 2 más cercana hacia abajo (o igual)
        p_base = 2 ** int(math.log2(num_teams))
        has_preliminary = num_teams > p_base
        
        if not has_preliminary:
            num_rounds = int(math.log2(p_base))
            num_prelim_matches = 0
        else:
            num_rounds = int(math.log2(p_base)) + 1
            num_prelim_matches = num_teams - p_base

        matches_by_round = {}
        
        # Nombres amigables para las rondas
        def get_round_name(r_idx, total_r, is_prelim):
            if is_prelim and r_idx == 1:
                return "Ronda Preliminar"
            
            # Calculamos la distancia a la final
            dist = total_r - r_idx
            if dist == 0: return "Final"
            if dist == 1: return "Semifinal"
            if dist == 2: return "Cuartos de Final"
            if dist == 3: return "Octavos de Final"
            return f"Ronda {r_idx}"

        # 3. Crear partidos por ronda
        for r in range(1, num_rounds + 1):
            if has_preliminary and r == 1:
                matches_in_round = num_prelim_matches
            else:
                # Si hay preliminar, la ronda r=2 es la base (p_base/2 partidos)
                # Si no hay preliminar, la ronda r=1 es la base (p_base/2 partidos)
                r_effective = r - 1 if has_preliminary else r
                matches_in_round = p_base // (2 ** r_effective)
            
            matches_by_round[r] = []
            for i in range(matches_in_round):
                match = TournamentMatch.objects.create(
                    tournament=tournament,
                    round_number=r,
                    round_name=get_round_name(r, num_rounds, has_preliminary),
                    order=i + 1,
                    status='pending'
                )
                matches_by_round[r].append(match)

        # 4. Conectar los partidos
        for r in range(1, num_rounds):
            current_round_matches = matches_by_round[r]
            next_round_matches = matches_by_round[r+1]
            
            for i, match in enumerate(current_round_matches):
                # El partido i de la ronda r conecta al partido floor(i/2) de la ronda r+1
                target_match = next_round_matches[i // 2]
                match.next_match = target_match
                match.position_in_next_match = 'team1' if i % 2 == 0 else 'team2'
                match.save()

        # 5. Asignar equipos
        team_idx = 0
        
        # Caso A: Equipos a la Ronda Preliminar (si existe)
        if has_preliminary:
            prelim_matches = matches_by_round[1]
            for match in prelim_matches:
                match.team1 = teams[team_idx]
                team_idx += 1
                match.team2 = teams[team_idx]
                team_idx += 1
                match.save()
            
            # Caso B: Equipos que pasan directo a la Ronda 2 (BYEs)
            base_round_matches = matches_by_round[2]
            for match in base_round_matches:
                # Si el slot no será llenado por un ganador de la preliminar, asignamos equipo directo
                if not match.team1 and not TournamentMatch.objects.filter(next_match=match, position_in_next_match='team1').exists():
                    if team_idx < num_teams:
                        match.team1 = teams[team_idx]
                        team_idx += 1
                
                if not match.team2 and not TournamentMatch.objects.filter(next_match=match, position_in_next_match='team2').exists():
                    if team_idx < num_teams:
                        match.team2 = teams[team_idx]
                        team_idx += 1
                match.save()
        else:
            # Caso C: Torneo normal (potencia de 2)
            for match in matches_by_round[1]:
                match.team1 = teams[team_idx]
                team_idx += 1
                match.team2 = teams[team_idx]
                team_idx += 1
                match.save()

        tournament.status = 'in_progress'
        tournament.save()
        
        return Response(
            {"message": f"Bracket de {num_rounds} rondas generado con éxito."},
            status=status.HTTP_200_OK
        )