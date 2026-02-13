from typing import List, Optional, Dict, Any
from ...domain.repositories.payment_repository import IPaymentRepository
from ...models import Payment # Asumiendo que Payment está en backend/payments/models.py
from users.models import User # Para el tipo de usuario

class GetPaymentListUseCase:
    """
    Caso de uso para obtener la lista de pagos.
    Esta clase reside en la capa de Aplicación.
    """
    def __init__(self, payment_repository: IPaymentRepository):
        self.payment_repository = payment_repository

    async def execute(self, user: Optional[User] = None, filters: Optional[Dict[str, Any]] = None) -> List[Payment]:
        return await self.payment_repository.get_all(user, filters)
