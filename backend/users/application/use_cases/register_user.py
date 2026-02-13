from typing import Dict, Any
from ...domain.repositories.user_repository import IUserRepository
from ...models import User, Role # Importar Role

class RegisterUserUseCase:
    """
    Caso de uso para registrar un nuevo usuario.
    Esta clase reside en la capa de Aplicación.
    """
    def __init__(self, user_repository: IUserRepository):
        self.user_repository = user_repository

    async def execute(self, user_data: Dict[str, Any]) -> User:
        # Si no se proporciona un rol, o si el rol es None, asignar el rol 'cliente' por defecto
        if 'role' not in user_data or user_data['role'] is None:
            try:
                # Obtener el objeto Role 'cliente'
                cliente_role = await self.user_repository.get_role_by_name('cliente')
                if cliente_role is None:
                    raise ValueError("El rol 'cliente' no existe en la base de datos. Asegúrate de que los roles estén poblados.")
                user_data['role'] = cliente_role
            except Role.DoesNotExist: # Esto ya lo maneja get_role_by_name devolviendo None
                raise ValueError("El rol 'cliente' no existe en la base de datos. Asegúrate de que los roles estén poblados.")
        
        return await self.user_repository.create(user_data)
