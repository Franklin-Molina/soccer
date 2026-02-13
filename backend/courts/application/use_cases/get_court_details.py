from typing import Optional
from ...domain.repositories.court_repository import ICourtRepository
from ...models import Court # Asumiendo que Court está en backend/courts/models.py

class GetCourtDetailsUseCase:
    """
    Caso de uso para obtener los detalles de una cancha específica.
    Esta clase reside en la capa de Aplicación.
    """
    def __init__(self, court_repository: ICourtRepository):
        self.court_repository = court_repository

    async def execute(self, court_id: int) -> Optional[Court]:
        return await self.court_repository.get_by_id(court_id)
