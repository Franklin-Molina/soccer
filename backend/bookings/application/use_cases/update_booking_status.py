from typing import Optional
from ...domain.repositories.booking_repository import IBookingRepository
from ...models import Booking # Asumiendo que Booking está en backend/bookings/models.py
from users.models import User # Para el tipo de usuario

class UpdateBookingStatusUseCase:
    """
    Caso de uso para actualizar el estado de una reserva.
    Esta clase reside en la capa de Aplicación.
    """
    def __init__(self, booking_repository: IBookingRepository):
        self.booking_repository = booking_repository

    async def execute(self, booking_id: int, status: str, user: Optional[User] = None) -> Optional[Booking]:
        # Aquí se podría añadir lógica de aplicación adicional si fuera necesario
        # (ej. verificar si el usuario tiene permiso para cambiar el estado,
        # enviar notificaciones, etc.)
        return await self.booking_repository.update_status(booking_id, status, user)
