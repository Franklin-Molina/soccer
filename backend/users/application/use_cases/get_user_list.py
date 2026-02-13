from typing import List, Optional, Dict, Any
from ...domain.repositories.user_repository import IUserRepository
from ...models import User # Asumiendo que User está en backend/users/models.py

class GetUserListUseCase:
    """
    Caso de uso para obtener la lista de usuarios, con filtros opcionales.
    Esta clase reside en la capa de Aplicación.
    """
    def __init__(self, user_repository: IUserRepository):
        self.user_repository = user_repository

    async def execute(self, filters: Optional[Dict[str, Any]] = None) -> List[User]:
        # El repositorio debería tener un método get_all o similar que acepte filtros
        # Por ahora, asumimos que el repositorio tiene un método get_all_users
        # o que adaptamos el método create en el repositorio para que no exista get_all
        # y que el repositorio tiene un método para filtrar por rol.
        # Si no, necesitaremos añadir un método get_all al IUserRepository y su implementación.
        
        # Asumiendo que IUserRepository tendrá un método get_all_users(filters)
        # Por ahora, si no existe, lo implementaremos en el repositorio.
        # Este caso de uso es simple y solo delega al repositorio.
        
        # Para este caso, si queremos filtrar por rol, el repositorio necesitará soportarlo.
        # Ejemplo de cómo se podría llamar si el repositorio lo soporta:
        # return await self.user_repository.get_all(filters=filters)
        
        # Por ahora, si el repositorio no tiene un get_all genérico,
        # y solo queremos listar usuarios con un rol específico (ej. 'admin'),
        # podríamos necesitar un método más específico en el repositorio o pasar el filtro aquí.
        
        # Vamos a asumir que el repositorio tendrá un método get_all que puede filtrar.
        # Si no, esta implementación necesitará ajuste o el repositorio necesitará ser extendido.
        
        # Por ahora, para avanzar, si el repositorio no tiene get_all,
        # este caso de uso no se puede implementar directamente sin modificar el repositorio.
        # Asumiremos que el repositorio se actualizará para tener un método get_all.
        
        # Si el repositorio tiene un método específico para filtrar por rol:
        # if filters and 'role' in filters:
        #     return await self.user_repository.get_by_role(filters['role'])
        # else:
        #     return await self.user_repository.get_all_users() # Asumiendo que existe este método
        
        # Simplificando: este caso de uso llamará a un método get_all en el repositorio
        # que se espera que maneje los filtros.
        return await self.user_repository.get_all(filters=filters)
