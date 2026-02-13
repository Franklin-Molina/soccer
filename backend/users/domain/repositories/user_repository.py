from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from ...models import User, Role # Importar Role

class IUserRepository(ABC):
    """
    Interfaz que define el contrato para un repositorio de usuarios.
    Esta interfaz reside en la capa de Dominio.
    """

    @abstractmethod
    async def get_by_id(self, user_id: int) -> Optional[User]:
        """
        Obtiene un usuario específico por su ID.
        """
        pass

    @abstractmethod
    async def get_by_username(self, username: str) -> Optional[User]:
        """
        Obtiene un usuario específico por su nombre de usuario.
        """
        pass
    
    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[User]:
        """
        Obtiene un usuario específico por su email.
        """
        pass

    @abstractmethod
    async def get_role_by_name(self, role_name: str) -> Optional[Role]:
        """
        Obtiene un objeto Role por su nombre.
        """
        pass

    @abstractmethod
    async def create(self, user_data: Dict[str, Any]) -> User:
        """
        Crea un nuevo usuario.
        user_data debe incluir 'username', 'email', 'password'.
        Opcionalmente 'first_name', 'last_name', 'age'.
        """
        pass

    @abstractmethod
    async def update(self, user_id: int, user_data: Dict[str, Any]) -> Optional[User]:
        """
        Actualiza un usuario existente.
        """
        pass

    @abstractmethod
    async def get_all(self, filters: Optional[Dict[str, Any]] = None) -> List[User]:
        """
        Obtiene una lista de todos los usuarios, con filtros opcionales (ej. por rol).
        """
        pass

    @abstractmethod
    async def delete(self, user_id: int) -> bool:
        """
        Elimina un usuario existente. Devuelve True si se eliminó, False en caso contrario.
        """
        pass
    
    # La lógica de login/autenticación se maneja a través de IAuthRepository
    # y los endpoints de JWT/dj-rest-auth.
    # Si se necesita una lógica de usuario más compleja (ej. cambiar contraseña, verificar email),
    # se pueden añadir métodos aquí.
