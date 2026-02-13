from typing import Optional
from ...domain.repositories.payment_repository import IPaymentRepository
from ...models import Payment # Asumiendo que Payment está en backend/payments/models.py
from users.models import User # Para el tipo de usuario

class UpdatePaymentStatusUseCase:
    """
    Caso de uso para actualizar el estado de un pago.
    Esta clase reside en la capa de Aplicación.
    """
    def __init__(self, payment_repository: IPaymentRepository):
        self.payment_repository = payment_repository

    async def execute(self, payment_id: int, status: str, user: Optional[User] = None) -> Optional[Payment]:
        # Aquí se podría añadir lógica de aplicación adicional si fuera necesario
        # (ej. verificar si el usuario tiene permiso para cambiar el estado,
        # procesar reembolso si el estado es 'REFUNDED', etc.)
        return await self.payment_repository.update_status(payment_id, status, user)
