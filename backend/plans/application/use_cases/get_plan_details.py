from typing import Optional
from ...domain.repositories.plan_repository import IPlanRepository
from ...models import Plan # Asumiendo que Plan está en backend/plans/models.py

class GetPlanDetailsUseCase:
    """
    Caso de uso para obtener los detalles de un plan específico.
    Esta clase reside en la capa de Aplicación.
    """
    def __init__(self, plan_repository: IPlanRepository):
        self.plan_repository = plan_repository

    async def execute(self, plan_id: int) -> Optional[Plan]:
        return await self.plan_repository.get_by_id(plan_id)
