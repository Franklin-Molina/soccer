from typing import List
from matches.domain.repositories.match_repository import IMatchRepository
from matches.models import OpenMatch

class ListOpenMatchesUseCase:
    def __init__(self, match_repository: IMatchRepository):
        self.match_repository = match_repository

    async def execute(self) -> List[OpenMatch]:
        return await self.match_repository.get_all_open_matches()
