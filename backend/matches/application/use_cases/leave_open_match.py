from typing import Optional
from matches.domain.repositories.match_repository import IMatchRepository
from matches.models import OpenMatch

class LeaveOpenMatchUseCase:
    def __init__(self, match_repository: IMatchRepository):
        self.match_repository = match_repository

    async def execute(self, match_id: int, user_id: int) -> Optional[OpenMatch]:
        return await self.match_repository.remove_participant_from_match(match_id, user_id)
