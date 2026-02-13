from typing import Dict, Any, Optional
from matches.domain.repositories.match_repository import IMatchRepository
from matches.models import OpenMatch

class UpdateOpenMatchUseCase:
    def __init__(self, match_repository: IMatchRepository):
        self.match_repository = match_repository

    async def execute(self, match_id: int, match_data: Dict[str, Any]) -> Optional[OpenMatch]:
        return await self.match_repository.update_open_match(match_id, match_data)
