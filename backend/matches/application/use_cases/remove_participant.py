from typing import Optional
from matches.domain.repositories.match_repository import IMatchRepository
from matches.models import OpenMatch

class RemoveParticipantUseCase:
    def __init__(self, match_repository: IMatchRepository):
        self.match_repository = match_repository

    async def execute(self, match_id: int, user_id_to_remove: int) -> Optional[OpenMatch]:
        # La lógica de negocio (ej. no se puede eliminar al creador)
        # debería estar aquí.
        match = await self.match_repository.get_open_match_by_id(match_id)
        if match and match.creator.id != user_id_to_remove:
            return await self.match_repository.remove_participant_from_match(match_id, user_id_to_remove)
        return None
