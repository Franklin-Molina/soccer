from typing import List
from matches.domain.repositories.match_repository import IMatchRepository
from matches.models import OpenMatch

class ListUpcomingMatchesUseCase:
    def __init__(self, match_repository: IMatchRepository):
        self.match_repository = match_repository

    def execute(self, user_id: int) -> List[OpenMatch]:
        return self.match_repository.get_upcoming_matches_for_user(user_id)
