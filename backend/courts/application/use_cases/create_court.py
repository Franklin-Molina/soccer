from typing import Dict, Any, Optional, List
from ...domain.repositories.court_repository import ICourtRepository
from ...models import Court # Asumiendo que Court está en backend/courts/models.py

class CreateCourtUseCase:
    """
    Caso de uso para crear una nueva cancha.
    Esta clase reside en la capa de Aplicación.
    """
    def __init__(self, court_repository: ICourtRepository):
        self.court_repository = court_repository

    async def execute(self, court_data: Dict[str, Any], images_data: Optional[List[Any]] = None) -> Court:
        # Aquí se podría añadir lógica de aplicación adicional si fuera necesario
        # (ej. validaciones, notificaciones, etc.) antes o después de llamar al repositorio.
        return await self.court_repository.create(court_data, images_data)
