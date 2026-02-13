from typing import Dict, Any
from ...domain.repositories.booking_repository import IBookingRepository
from ...models import Booking # Asumiendo que Booking está en backend/bookings/models.py
from users.models import User # Para el tipo de usuario

class CreateBookingUseCase:
    """
    Caso de uso para crear una nueva reserva.
    Esta clase reside en la capa de Aplicación.
    """
    def __init__(self, booking_repository: IBookingRepository):
        self.booking_repository = booking_repository

    async def execute(self, booking_data: Dict[str, Any]) -> Booking:
        # Aquí se podría añadir lógica de aplicación adicional si fuera necesario
        # (ej. validaciones de negocio complejas, notificaciones, etc.)
        # La validación de disponibilidad ya se maneja en el repositorio por ahora.
        # El usuario ahora está incluido en booking_data
       # print("Datos de reserva enviados al repositorio:", booking_data) # Debug print
        return await self.booking_repository.create(booking_data)
