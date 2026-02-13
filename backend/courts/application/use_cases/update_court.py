from typing import Dict, Any, Optional, List
from ...domain.repositories.court_repository import ICourtRepository
from ...models import Court # Asumiendo que Court está en backend/courts/models.py

class UpdateCourtUseCase:
    """
    Caso de uso para actualizar una cancha existente.
    Esta clase reside en la capa de Aplicación.
    """
    def __init__(self, court_repository: ICourtRepository):
        self.court_repository = court_repository

    async def execute(self, court_id: int, court_data: Dict[str, Any], images_data: Optional[List[Any]] = None, images_to_delete: Optional[List[int]] = None) -> Optional[Court]:
        """
        Ejecuta el caso de uso para actualizar una cancha.

        Args:
            court_id (int): El ID de la cancha a actualizar.
            court_data (Dict[str, Any]): Los datos de la cancha a actualizar.
            images_data (Optional[List[Any]]): Lista de nuevos archivos de imagen a añadir.
            images_to_delete (Optional[List[int]]): Lista de IDs de imágenes existentes a eliminar.

        Returns:
            Optional[Court]: La cancha actualizada o None si no se encontró.
        """
        # Aquí se podría añadir lógica de aplicación adicional si fuera necesario.
        return await self.court_repository.update(court_id, court_data, images_data, images_to_delete)
