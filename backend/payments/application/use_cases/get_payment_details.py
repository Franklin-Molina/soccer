from typing import Optional
from ...domain.repositories.payment_repository import IPaymentRepository
from ...models import Payment # Asumiendo que Payment está en backend/payments/models.py
from users.models import User # Para el tipo de usuario

class GetPaymentDetailsUseCase:
    """
    Caso de uso para obtener los detalles de un pago específico.
    Esta clase reside en la capa de Aplicación.
    """
    def __init__(self, payment_repository: IPaymentRepository):
        self.payment_repository = payment_repository

    async def execute(self, payment_id: int, user: Optional[User] = None) -> Optional[Payment]:
        return await self.payment_repository.get_by_id(payment_id, user)
