from typing import Optional, Dict, Any
from ...domain.repositories.user_repository import IUserRepository
from ...models import User

class UpdateUserStatusUseCase:
    """
    Caso de uso para actualizar el estado (activo/inactivo) de un usuario.
    Esta clase reside en la capa de Aplicación.
    """
    def __init__(self, user_repository: IUserRepository):
        self.user_repository = user_repository

    async def execute(self, user_id: int, is_active: bool) -> Optional[User]:
        # El caso de uso UpdateUserProfileUseCase podría usarse para esto si se pasa {'is_active': is_active}
        # Pero crear un caso de uso específico para cambiar el estado puede ser más claro.
        user_data_to_update: Dict[str, Any] = {'is_active': is_active}
        return await self.user_repository.update(user_id, user_data_to_update)
