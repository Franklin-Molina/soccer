from typing import Optional
from ...domain.repositories.booking_repository import IBookingRepository
from ...models import Booking # Asumiendo que Booking está en backend/bookings/models.py
from users.models import User # Para el tipo de usuario

class GetBookingDetailsUseCase:
    """
    Caso de uso para obtener los detalles de una reserva específica.
    Esta clase reside en la capa de Aplicación.
    """
    def __init__(self, booking_repository: IBookingRepository):
        self.booking_repository = booking_repository

    async def execute(self, booking_id: int, user: Optional[User] = None) -> Optional[Booking]:
        return await self.booking_repository.get_by_id(booking_id, user)
