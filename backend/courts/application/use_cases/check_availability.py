from typing import List, Optional, Dict, Any
from ...domain.repositories.court_repository import ICourtRepository

class CheckAvailabilityUseCase:
    """
    Caso de uso para verificar la disponibilidad de canchas.
    Esta clase reside en la capa de Aplicación.
    """
    def __init__(self, court_repository: ICourtRepository):
        self.court_repository = court_repository

    async def execute(self, start_time: str, end_time: str, court_id: Optional[int] = None) -> List[Dict[str, Any]]:
        # Aquí se podría añadir lógica de aplicación adicional si fuera necesario.
        return await self.court_repository.check_availability(start_time, end_time, court_id)
