from typing import List, Optional, Dict, Any
from ...domain.repositories.plan_repository import IPlanRepository
from ...models import Plan # Asumiendo que Plan está en backend/plans/models.py

class GetPlanListUseCase:
    """
    Caso de uso para obtener la lista de planes.
    Esta clase reside en la capa de Aplicación.
    """
    def __init__(self, plan_repository: IPlanRepository):
        self.plan_repository = plan_repository

    async def execute(self, filters: Optional[Dict[str, Any]] = None) -> List[Plan]:
        return await self.plan_repository.get_all(filters)
