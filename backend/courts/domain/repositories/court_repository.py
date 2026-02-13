from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from ...models import Court # Asumiendo que Court está en backend/courts/models.py

class ICourtRepository(ABC):
    """
    Interfaz que define el contrato para un repositorio de canchas.
    Esta interfaz reside en la capa de Dominio.
    """

    @abstractmethod
    async def get_all(self, filters: Optional[Dict[str, Any]] = None) -> List[Court]:
        """
        Obtiene una lista de todas las canchas, con filtros opcionales.
        """
        pass

    @abstractmethod
    async def get_by_id(self, court_id: int) -> Optional[Court]:
        """
        Obtiene una cancha específica por su ID.
        """
        pass

    @abstractmethod
    async def create(self, court_data: Dict[str, Any], images_data: Optional[List[Any]] = None) -> Court:
        """
        Crea una nueva cancha.
        'images_data' podría ser una lista de archivos de imagen.
        """
        pass

    @abstractmethod
    async def update(self, court_id: int, court_data: Dict[str, Any], images_data: Optional[List[Any]] = None) -> Optional[Court]:
        """
        Actualiza una cancha existente.
        """
        pass

    @abstractmethod
    async def delete(self, court_id: int) -> bool:
        """
        Elimina una cancha existente. Devuelve True si se eliminó, False en caso contrario.
        """
        pass

    @abstractmethod
    async def check_availability(self, start_time: str, end_time: str, court_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Verifica la disponibilidad de canchas para un rango de tiempo específico.
        Si se proporciona court_id, verifica solo para esa cancha.
        Devuelve una lista de diccionarios con la información de disponibilidad.
        Ejemplo: [{'id': 1, 'name': 'Cancha 1', 'is_available': True}, ...]
        """
        pass

    # Podríamos añadir un método para get_weekly_availability si el backend lo soporta directamente.
    # Por ahora, la lógica de get_weekly_availability en el frontend hace múltiples llamadas a check_availability.
