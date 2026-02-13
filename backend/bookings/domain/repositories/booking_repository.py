from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from ...models import Booking # Asumiendo que Booking está en backend/bookings/models.py
from users.models import User # Para filtrar por usuario

class IBookingRepository(ABC):
    """
    Interfaz que define el contrato para un repositorio de reservas.
    Esta interfaz reside en la capa de Dominio.
    """

    @abstractmethod
    async def get_all(self, user_id: Optional[int] = None, filters: Optional[Dict[str, Any]] = None) -> List[Booking]:
        """
        Obtiene una lista de todas las reservas, opcionalmente filtradas por ID de usuario o otros criterios.
        """
        pass

    @abstractmethod
    async def get_by_id(self, booking_id: int, user: Optional[User] = None) -> Optional[Booking]:
        """
        Obtiene una reserva específica por su ID, opcionalmente verificando la pertenencia al usuario.
        """
        pass

    @abstractmethod
    async def create(self, booking_data: Dict[str, Any], user: User) -> Booking:
        """
        Crea una nueva reserva para un usuario específico.
        booking_data debe incluir 'court', 'start_time', 'end_time'.
        El usuario se pasa como argumento.
        """
        pass

    @abstractmethod
    async def update_status(self, booking_id: int, status: str, user: Optional[User] = None) -> Optional[Booking]:
        """
        Actualiza el estado de una reserva existente (ej. 'CANCELLED').
        Opcionalmente verifica la pertenencia al usuario si no es admin.
        """
        pass
    
    # Podríamos añadir un método delete si se permite la eliminación física de reservas,
    # pero generalmente se prefiere cambiar el estado a 'CANCELLED'.
