from typing import Dict, Any, Optional, List
from asgiref.sync import sync_to_async
from django.db import transaction
from django.utils import timezone
from typing import Dict, Any, Optional, List
from asgiref.sync import sync_to_async
from django.db import transaction
from django.utils import timezone
from matches.domain.repositories.match_repository import IMatchRepository
from matches.models import OpenMatch, MatchCategory, MatchParticipant
from users.models import User
from courts.models import Court
from bookings.models import Booking # Importar el modelo Booking

class DjangoMatchRepository(IMatchRepository):

    def _get_open_match_by_id_sync(self, match_id: int) -> Optional[OpenMatch]:
        try:
            return OpenMatch.objects.select_related('court', 'category', 'creator').prefetch_related('participants__user').get(id=match_id)
        except OpenMatch.DoesNotExist:
            return None

    @sync_to_async
    def create_open_match(self, match_data: Dict[str, Any]) -> OpenMatch:
        with transaction.atomic():
            match = OpenMatch.objects.create(**match_data)
            MatchParticipant.objects.create(match=match, user=match.creator)

            # Crear una reserva asociada al partido
            try:
                Booking.objects.create(
                    user=match.creator,
                    court=match.court,
                    start_time=match.start_time,
                    end_time=match.end_time,
                    status='confirmed' # O 'pending', dependiendo de la lógica de negocio
                )
            except Exception as e:
                # Log the error, but don't prevent match creation if booking fails
                print(f"Error creating booking for match {match.id}: {e}")
                # Dependiendo de la lógica de negocio, podrías querer revertir la creación del partido aquí
                # o marcar el partido con un estado especial. Por ahora, solo lo registramos.
            
            return match

    @sync_to_async
    def get_all_open_matches(self) -> List[OpenMatch]:
        now = timezone.now()
        return list(
            OpenMatch.objects.select_related('court', 'category', 'creator')
            .prefetch_related('participants__user')
            .filter(status='OPEN', start_time__gte=now)
            .order_by('start_time')
        )

    @sync_to_async
    def get_open_match_by_id(self, match_id: int) -> Optional[OpenMatch]:
        return self._get_open_match_by_id_sync(match_id)

    @sync_to_async
    def add_participant_to_match(self, match_id: int, user_id: int) -> Optional[OpenMatch]:
        with transaction.atomic():
            match = self._get_open_match_by_id_sync(match_id)
            if not match:
                return None
            
            if match.participants.count() >= match.players_needed + 1:
                return None

            user = User.objects.get(id=user_id)
            # Evitar que un usuario se una dos veces
            if MatchParticipant.objects.filter(match=match, user=user).exists():
                return match # Opcional: devolver el partido sin cambios o lanzar error

            MatchParticipant.objects.create(match=match, user=user)
            
            # El número total de jugadores es el creador (1) + los que se necesitan.
            total_players_required = match.players_needed + 1
            
            # Contamos cuántos participantes hay AHORA.
            current_participant_count = match.participants.count()

            if current_participant_count >= total_players_required:
                match.status = OpenMatch.MatchStatus.FULL
                match.save(update_fields=['status'])

            return match

    @sync_to_async
    def remove_participant_from_match(self, match_id: int, user_id: int) -> Optional[OpenMatch]:
        with transaction.atomic():
            match = self._get_open_match_by_id_sync(match_id)
            if not match:
                return None

            participant = MatchParticipant.objects.filter(match_id=match_id, user_id=user_id).first()
            if participant:
                participant.delete()
                if match.status == OpenMatch.MatchStatus.FULL:
                    match.status = OpenMatch.MatchStatus.OPEN
                    match.save()
            return match

    @sync_to_async
    def get_all_categories(self) -> List[MatchCategory]:
        return list(MatchCategory.objects.all())

    def get_upcoming_matches_for_user(self, user_id: int) -> List[OpenMatch]:
        now = timezone.now()
        return list(
            OpenMatch.objects.select_related('court', 'category', 'creator')
            .prefetch_related('participants__user')
            .filter(
                participants__user_id=user_id,
                start_time__gte=now
            )
            .exclude(status=OpenMatch.MatchStatus.CANCELLED)
            .order_by('start_time')
        )

    @sync_to_async
    def update_open_match(self, match_id: int, match_data: Dict[str, Any]) -> Optional[OpenMatch]:
        with transaction.atomic():
            match = self._get_open_match_by_id_sync(match_id)
            if not match:
                return None

            # Actualizar campos
            for key, value in match_data.items():
                setattr(match, key, value)
            
            match.save()
            return match
