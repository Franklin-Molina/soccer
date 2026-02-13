from typing import Dict, Any, Optional
from ...domain.repositories.user_repository import IUserRepository
from ...models import User # Asumiendo que User está en backend/users/models.py

class UpdateUserProfileUseCase:
    """
    Caso de uso para actualizar el perfil de un usuario.

    Esta clase reside en la capa de Aplicación y coordina la actualización
    de los datos del perfil de un usuario a través del repositorio.
    """
    def __init__(self, user_repository: IUserRepository):
        """
        Inicializa el caso de uso con un repositorio de usuarios.

        Args:
            user_repository (IUserRepository): El repositorio para interactuar con los datos del usuario.
        """
        self.user_repository = user_repository

    async def execute(self, user_id: int, user_data: Dict[str, Any]) -> Optional[User]:
        """
        Ejecuta la lógica para actualizar el perfil de un usuario.

        Filtra los datos de entrada para asegurar que el nombre de usuario (username)
        no pueda ser modificado a través de este caso de uso.

        Args:
            user_id (int): El ID del usuario a actualizar.
            user_data (Dict[str, Any]): Un diccionario con los datos del perfil a actualizar.

        Returns:
            Optional[User]: El objeto User actualizado si la operación fue exitosa,
                            o None si el usuario no fue encontrado o la actualización falló.
        """
        # Eliminar 'username' de los datos si está presente para evitar su modificación
        if 'username' in user_data:
            del user_data['username']

        # Si no quedan datos para actualizar después de eliminar el username, retornar el usuario actual
        if not user_data:
            return await self.user_repository.get_by_id(user_id)

        return await self.user_repository.update(user_id, user_data)
