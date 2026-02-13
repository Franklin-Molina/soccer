from typing import Dict, Any
from matches.domain.repositories.match_repository import IMatchRepository
from matches.models import OpenMatch

class CreateOpenMatchUseCase:
    def __init__(self, match_repository: IMatchRepository):
        self.match_repository = match_repository

    async def execute(self, match_data: Dict[str, Any]) -> OpenMatch:
        # Aquí se podría añadir lógica de validación extra si fuera necesario
        # Por ejemplo, verificar que la cancha esté disponible en ese horario
        return await self.match_repository.create_open_match(match_data)
