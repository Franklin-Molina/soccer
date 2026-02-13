from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from ...models import Plan # Asumiendo que Plan está en backend/plans/models.py

class IPlanRepository(ABC):
    """
    Interfaz que define el contrato para un repositorio de planes.
    Esta interfaz reside en la capa de Dominio.
    """

    @abstractmethod
    async def get_all(self, filters: Optional[Dict[str, Any]] = None) -> List[Plan]:
        """
        Obtiene una lista de todos los planes, con filtros opcionales.
        """
        pass

    @abstractmethod
    async def get_by_id(self, plan_id: int) -> Optional[Plan]:
        """
        Obtiene un plan específico por su ID.
        """
        pass

    # La creación, actualización y eliminación de planes podrían ser manejadas
    # directamente por las vistas de administrador si no hay lógica de negocio compleja.
    # Si se necesita lógica de negocio, se pueden añadir métodos aquí y casos de uso.
    # @abstractmethod
    # async def create(self, plan_data: Dict[str, Any]) -> Plan:
    #     pass

    # @abstractmethod
    # async def update(self, plan_id: int, plan_data: Dict[str, Any]) -> Optional[Plan]:
    #     pass

    # @abstractmethod
    # async def delete(self, plan_id: int) -> bool:
    #     pass
