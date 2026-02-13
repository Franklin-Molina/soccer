from ...domain.repositories.court_repository import ICourtRepository

class DeleteCourtUseCase:
    """
    Caso de uso para eliminar una cancha existente.
    Esta clase reside en la capa de Aplicación.
    """
    def __init__(self, court_repository: ICourtRepository):
        self.court_repository = court_repository

    async def execute(self, court_id: int) -> bool:
        # Aquí se podría añadir lógica de aplicación adicional si fuera necesario.
        return await self.court_repository.delete(court_id)
