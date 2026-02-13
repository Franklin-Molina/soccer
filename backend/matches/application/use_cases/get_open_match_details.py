from typing import Optional
from matches.domain.repositories.match_repository import IMatchRepository
from matches.models import OpenMatch

class GetOpenMatchDetailsUseCase:
    def __init__(self, match_repository: IMatchRepository):
        self.match_repository = match_repository

    async def execute(self, match_id: int) -> Optional[OpenMatch]:
        return await self.match_repository.get_open_match_by_id(match_id)
