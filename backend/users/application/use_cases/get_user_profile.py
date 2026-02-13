from typing import Optional
from ...domain.repositories.user_repository import IUserRepository
from ...models import User # Asumiendo que User está en backend/users/models.py

class GetUserProfileUseCase:
    """
    Caso de uso para obtener el perfil de un usuario.
    Esta clase reside en la capa de Aplicación.
    """
    def __init__(self, user_repository: IUserRepository):
        self.user_repository = user_repository

    async def execute(self, user_id: int) -> Optional[User]:
        # Aquí se podría añadir lógica de aplicación adicional si fuera necesario
        # (ej. verificar permisos para ver el perfil, etc.)
        return await self.user_repository.get_by_id(user_id)
