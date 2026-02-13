from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from ...models import Payment # Asumiendo que Payment está en backend/payments/models.py
from users.models import User # Para filtrar por usuario

class IPaymentRepository(ABC):
    """
    Interfaz que define el contrato para un repositorio de pagos.
    Esta interfaz reside en la capa de Dominio.
    """

    @abstractmethod
    async def get_all(self, user: Optional[User] = None, filters: Optional[Dict[str, Any]] = None) -> List[Payment]:
        """
        Obtiene una lista de todos los pagos, opcionalmente filtrados por usuario o otros criterios.
        """
        pass

    @abstractmethod
    async def get_by_id(self, payment_id: int, user: Optional[User] = None) -> Optional[Payment]:
        """
        Obtiene un pago específico por su ID, opcionalmente verificando la pertenencia al usuario.
        """
        pass

    @abstractmethod
    async def create(self, payment_data: Dict[str, Any], user: User) -> Payment:
        """
        Crea un nuevo pago para un usuario específico.
        payment_data debe incluir 'amount', 'status', 'payment_method'.
        Opcionalmente 'booking' si está asociado a una reserva.
        El usuario se pasa como argumento.
        """
        pass

    @abstractmethod
    async def update_status(self, payment_id: int, status: str, user: Optional[User] = None) -> Optional[Payment]:
        """
        Actualiza el estado de un pago existente (ej. 'COMPLETED', 'FAILED', 'REFUNDED').
        Opcionalmente verifica la pertenencia al usuario si no es admin.
        """
        pass
    
    # Podrían añadirse otros métodos como procesar pago, etc.
