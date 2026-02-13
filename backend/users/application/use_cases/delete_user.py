from ...domain.repositories.user_repository import IUserRepository

class DeleteUserUseCase:
    """
    Caso de uso para eliminar un usuario.
    Esta clase reside en la capa de Aplicación.
    """
    def __init__(self, user_repository: IUserRepository):
        self.user_repository = user_repository

    async def execute(self, user_id: int) -> bool:
        # El repositorio debería tener un método delete
        # Necesito añadirlo a IUserRepository y DjangoUserRepository
        return await self.user_repository.delete(user_id)
