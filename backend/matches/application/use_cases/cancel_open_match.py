from typing import Optional
from asgiref.sync import sync_to_async
from matches.domain.repositories.match_repository import IMatchRepository
from matches.models import OpenMatch

class CancelOpenMatchUseCase:
    def __init__(self, match_repository: IMatchRepository):
        self.match_repository = match_repository

    async def execute(self, match_id: int) -> Optional[OpenMatch]:
        # La lógica de si se puede cancelar o no (ej. si ya empezó)
        # podría ir aquí o en el repositorio..
        # Por ahora, simplemente cambia el estado.
        match = await self.match_repository.get_open_match_by_id(match_id)
        if match:
            match.status = OpenMatch.MatchStatus.CANCELLED
            await sync_to_async(match.save)(update_fields=['status'])
        return match
