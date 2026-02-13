# backend/courts/application/use_cases/get_weekly_availability.py

from datetime import datetime, timedelta

class GetWeeklyAvailabilityUseCase:
    """
    Caso de uso para obtener la disponibilidad semanal de una cancha específica.
    """
    def __init__(self, court_repository):
        """
        Inicializa el caso de uso con un repositorio de canchas.

        Args:
            court_repository: El repositorio de canchas que implementa la interfaz CourtRepository.
        """
        self.court_repository = court_repository

    async def execute(self, court_id: int, start_date: datetime, end_date: datetime):
        """
        Ejecuta el caso de uso para obtener la disponibilidad semanal.

        Args:
            court_id (int): El ID de la cancha.
            start_date (datetime): La fecha y hora de inicio del rango semanal.
            end_date (datetime): La fecha y hora de fin del rango semanal.

        Returns:
            dict: Un diccionario que representa la disponibilidad semanal de la cancha.
                  Ejemplo: { 'YYYY-MM-DD': { hour: boolean, ... }, ... }
        """
        # La lógica para obtener la disponibilidad detallada por hora y día
        # se delegará al repositorio.
        try:
            weekly_availability = await self.court_repository.get_weekly_availability(
                court_id, start_date, end_date
            )
            return weekly_availability
        except Exception as e:
            print(f"Error en GetWeeklyAvailabilityUseCase: {e}")
            raise
