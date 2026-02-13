from typing import List, Optional, Dict, Any
from ...domain.repositories.court_repository import ICourtRepository
from ...models import Court # Asumiendo que Court está en backend/courts/models.py

class GetCourtListUseCase:
    """
    Caso de uso para obtener la lista de canchas.
    Esta clase reside en la capa de Aplicación.
    """
    def __init__(self, court_repository: ICourtRepository):
        self.court_repository = court_repository

    async def execute(self, filters: Optional[Dict[str, Any]] = None) -> List[Court]:
        return await self.court_repository.get_all(filters)
