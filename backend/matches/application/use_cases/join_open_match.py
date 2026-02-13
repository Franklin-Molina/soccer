from typing import Optional
from matches.domain.repositories.match_repository import IMatchRepository
from matches.models import OpenMatch

class JoinOpenMatchUseCase:
    def __init__(self, match_repository: IMatchRepository):
        self.match_repository = match_repository

    async def execute(self, match_id: int, user_id: int) -> Optional[OpenMatch]:
        # Aquí se podrían añadir validaciones, como si el usuario ya está en el partido
        return await self.match_repository.add_participant_to_match(match_id, user_id)
