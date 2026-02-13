from typing import Dict, Any
from ...domain.repositories.payment_repository import IPaymentRepository
from ...models import Payment # Asumiendo que Payment está en backend/payments/models.py
from users.models import User # Para el tipo de usuario

class CreatePaymentUseCase:
    """
    Caso de uso para crear un nuevo pago.
    Esta clase reside en la capa de Aplicación.
    """
    def __init__(self, payment_repository: IPaymentRepository):
        self.payment_repository = payment_repository

    async def execute(self, payment_data: Dict[str, Any], user: User) -> Payment:
        # Aquí se podría añadir lógica de aplicación adicional si fuera necesario
        # (ej. validaciones, interacción con pasarelas de pago, etc.)
        return await self.payment_repository.create(payment_data, user)
