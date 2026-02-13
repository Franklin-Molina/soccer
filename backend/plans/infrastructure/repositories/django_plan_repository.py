from typing import List, Optional, Dict, Any
from asgiref.sync import sync_to_async

from ...models import Plan # Modelo de Django Plan
from ...domain.repositories.plan_repository import IPlanRepository # Interfaz del Dominio

class DjangoPlanRepository(IPlanRepository):
    """
    Implementación del repositorio de planes que utiliza el ORM de Django.
    Esta clase reside en la capa de Infraestructura.
    """

    @sync_to_async
    def get_all(self, filters: Optional[Dict[str, Any]] = None) -> List[Plan]:
        queryset = Plan.objects.all()
        if filters:
            # Aplicar filtros si se proporcionan
            # Ejemplo: queryset = queryset.filter(**filters)
            # Por ahora, no se implementan filtros específicos para planes.
            pass
        return list(queryset)

    @sync_to_async
    def get_by_id(self, plan_id: int) -> Optional[Plan]:
        try:
            return Plan.objects.get(pk=plan_id)
        except Plan.DoesNotExist:
            return None

    # La creación, actualización y eliminación de planes se pueden manejar
    # directamente en las vistas de administrador si no hay lógica de negocio compleja.
    # Si se necesita lógica de negocio, se pueden implementar aquí.
