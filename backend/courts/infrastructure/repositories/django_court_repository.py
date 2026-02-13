from typing import List, Optional, Dict, Any
from django.db import transaction
from asgiref.sync import sync_to_async # Importar sync_to_async
from ...models import Court, CourtImage # Modelos de Django
from ...domain.repositories.court_repository import ICourtRepository # Interfaz del Dominio
from ...filters import CourtFilter # Asumiendo que CourtFilter está en backend/courts/filters.py
from django.utils import timezone # Para check_availability
from django.db.models import Q # Para queries complejas en check_availability
from datetime import datetime, timedelta # Importar datetime y timedelta

class DjangoCourtRepository(ICourtRepository):
    """
    Implementación del repositorio de canchas que utiliza el ORM de Django.
    Esta clase reside en la capa de Infraestructura.
    """

    async def get_all(self, filters: Optional[Dict[str, Any]] = None) -> List[Court]:
        queryset = Court.objects.all().prefetch_related('images')
        if filters:
            # Aplicar filtros dinámicamente basados en el diccionario de filtros
            # Esto permite flexibilidad para diferentes criterios de filtrado.
            if 'name__icontains' in filters:
                queryset = queryset.filter(name__icontains=filters['name__icontains'])
            
            # Filtrar por el estado 'is_active' si se proporciona en los filtros
            if 'is_active' in filters and isinstance(filters['is_active'], bool):
                queryset = queryset.filter(is_active=filters['is_active'])
            elif 'is_active' in filters and isinstance(filters['is_active'], str):
                # Convertir string a booleano si es necesario (ej. "true" o "false")
                if filters['is_active'].lower() == 'true':
                    queryset = queryset.filter(is_active=True)
                elif filters['is_active'].lower() == 'false':
                    queryset = queryset.filter(is_active=False)
        
        # Usar sync_to_async para operaciones de base de datos síncronas
        return await sync_to_async(list)(queryset)

    async def get_by_id(self, court_id: int) -> Optional[Court]:
        try:
            # Usar sync_to_async para operaciones de base de datos síncronas
            return await sync_to_async(Court.objects.prefetch_related('images').get)(pk=court_id)
        except Court.DoesNotExist:
            return None

    @sync_to_async # Envolver todo el método transaccional
    @transaction.atomic 
    def _create_court_sync(self, court_data: Dict[str, Any], images_data: Optional[List[Any]] = None) -> Court:
        images_to_create = court_data.pop('images', images_data or [])
        
        # Asegurarse de que la cancha siempre se cree como activa
        court_data['is_active'] = True 
        
        court = Court.objects.create(**court_data)
        if images_to_create:
            for image_file in images_to_create:
                CourtImage.objects.create(court=court, image=image_file)
        return court

    async def create(self, court_data: Dict[str, Any], images_data: Optional[List[Any]] = None) -> Court:
        return await self._create_court_sync(court_data, images_data)

    @sync_to_async
    @transaction.atomic
    def _update_court_sync(self, court: Court, court_data: Dict[str, Any], images_data: Optional[List[Any]] = None, images_to_delete: Optional[List[int]] = None) -> Court:
        images_to_create = court_data.pop('images', images_data or [])
        
        # Eliminar imágenes existentes si se proporcionan IDs
        if images_to_delete:
            CourtImage.objects.filter(id__in=images_to_delete).delete()

        for key, value in court_data.items():
            setattr(court, key, value)
        court.save()

        if images_to_create:
            for image_file in images_to_create:
                CourtImage.objects.create(court=court, image=image_file)
        return court

    async def update(self, court_id: int, court_data: Dict[str, Any], images_data: Optional[List[Any]] = None, images_to_delete: Optional[List[int]] = None) -> Optional[Court]:
        court = await self.get_by_id(court_id) # get_by_id ya es async
        if not court:
            return None
        return await self._update_court_sync(court, court_data, images_data, images_to_delete)

    @sync_to_async
    @transaction.atomic # Asegurar que la operación sea atómica
    def _delete_court_sync(self, court: Court) -> None:
        # Eliminar las imágenes asociadas manualmente para que se llame al método delete() de CourtImage
        # Esto asegura que los archivos físicos se eliminen.
        for image in court.images.all():
            image.delete()
        
        # Ahora eliminar la instancia de la cancha, lo que también eliminará las relaciones en cascada
        # (aunque las imágenes ya fueron manejadas)
        court.delete()

    async def delete(self, court_id: int) -> bool:
        court = await self.get_by_id(court_id) # get_by_id ya es async
        if not court:
            return False
        await self._delete_court_sync(court)
        return True

    @sync_to_async
    def _check_availability_sync(self, start_time_str: str, end_time_str: str, court_id: Optional[int] = None) -> List[Dict[str, Any]]:
        start_dt = timezone.datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
        end_dt = timezone.datetime.fromisoformat(end_time_str.replace('Z', '+00:00'))

        courts_to_check = Court.objects.all()
        if court_id:
            courts_to_check = courts_to_check.filter(pk=court_id)

        availability_results = []
        for court_obj in courts_to_check: # Renombrar variable para evitar conflicto con el modelo Court
            overlapping_bookings = court_obj.booking_set.filter(
                Q(start_time__lt=end_dt) & Q(end_time__gt=start_dt) &
                ~Q(status='CANCELLED')
            ).exists()

            availability_results.append({
                'id': court_obj.id,
                'name': court_obj.name,
                'is_available': not overlapping_bookings
            })
        return availability_results

    async def check_availability(self, start_time: str, end_time: str, court_id: Optional[int] = None) -> List[Dict[str, Any]]:
        return await self._check_availability_sync(start_time, end_time, court_id)

    @sync_to_async
    def _get_weekly_availability_sync(self, court_id: int, start_date: datetime, end_date: datetime) -> Dict[str, Dict[int, bool]]:
        from bookings.models import Booking # Importar el modelo Booking aquí para evitar circular imports

        try:
            court = Court.objects.get(pk=court_id)
        except Court.DoesNotExist:
            return {} # O lanzar una excepción específica

        # Inicializar la estructura de disponibilidad semanal
        weekly_availability = {}
        current_date = start_date.date()
        while current_date <= end_date.date():
            date_str = current_date.strftime('%Y-%m-%d')
            weekly_availability[date_str] = {hour: True for hour in range(6, 24)} # Horas de 6 AM a 11 PM
            current_date += timedelta(days=1)

        # Obtener todas las reservas para la cancha en el rango de fechas
        # Considerar solo reservas CONFIRMED o PENDING
     #   print(f"DEBUG: Consultando reservas para cancha {court_id} ({court.name}) en el rango de {start_date} a {end_date}") # Debug print
        bookings = Booking.objects.filter(
            court=court,
            start_time__lt=end_date,
            end_time__gt=start_date
        ).exclude(status='CANCELLED') # Excluir reservas canceladas

        # Marcar las horas ocupadas
    #    print(f"DEBUG: Procesando {len(bookings)} reservas para la cancha {court_id} en el rango {start_date} a {end_date}") # Debug print
        for booking in bookings:
            # Convertir las horas de reserva a la zona horaria local configurada en settings.py
            booking_start_local = timezone.localtime(booking.start_time)
            booking_end_local = timezone.localtime(booking.end_time)

        #    print(f"DEBUG: Reserva encontrada: {booking.id} de {booking_start_local} a {booking_end_local} (Local Time)") # Debug print

            # Asegurarse de que las fechas de inicio y fin de la reserva estén dentro del rango semanal
            # Convertir start_date y end_date a la zona horaria local para la comparación
            start_date_local = timezone.localtime(start_date)
            end_date_local = timezone.localtime(end_date)

            effective_start = max(booking_start_local, start_date_local)
            effective_end = min(booking_end_local, end_date_local)

          #  print(f"DEBUG: Rango efectivo de la reserva dentro de la semana: de {effective_start} a {effective_end}") # Debug print

          #  print(f"DEBUG: Rango efectivo de la reserva dentro de la semana (Local Time): de {effective_start} a {effective_end}") # Debug print

            # Redondear la hora de inicio de la reserva al inicio de la hora actual o siguiente
            # Si la reserva empieza a las 10:01, la hora 10:00 ya está ocupada.
            # Si la reserva empieza a las 10:00, la hora 10:00 está ocupada.
            current_hour_dt = effective_start.replace(minute=0, second=0, microsecond=0)
            
            # Si la reserva termina exactamente en una hora (ej. 11:00), esa hora no se considera ocupada
            # Si la reserva termina a las 11:01, la hora 11:00 sí se considera ocupada
            # Ajustar effective_end para que el bucle incluya la última hora si la reserva la ocupa parcialmente
            adjusted_effective_end = effective_end
            if effective_end.minute > 0 or effective_end.second > 0 or effective_end.microsecond > 0:
                adjusted_effective_end = effective_end.replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)
            
            while current_hour_dt < adjusted_effective_end:
                date_str = current_hour_dt.strftime('%Y-%m-%d')
                hour = current_hour_dt.hour
                
                # Solo marcar si la hora está dentro del rango de 6 AM a 11 PM (23)
                if 6 <= hour <= 23:
                    # print(f"DEBUG: Marcando hora como no disponible: {date_str} {hour}:00 (Local Time)") # Debug print
                    if date_str in weekly_availability and hour in weekly_availability[date_str]:
                        weekly_availability[date_str][hour] = False # Marcar como no disponible
                
                current_hour_dt += timedelta(hours=1)
        
       # print(f"DEBUG: Disponibilidad semanal final generada: {weekly_availability}") # Debug print
        return weekly_availability

    async def get_weekly_availability(self, court_id: int, start_date: datetime, end_date: datetime) -> Dict[str, Dict[int, bool]]:
        """
        Obtiene la disponibilidad hora por hora para una cancha específica durante una semana.

        Args:
            court_id (int): El ID de la cancha.
            start_date (datetime): La fecha y hora de inicio del rango semanal.
            end_date (datetime): La fecha y hora de fin del rango semanal.

        Returns:
            dict: Un diccionario anidado que representa la disponibilidad semanal.
                  Ejemplo: { 'YYYY-MM-DD': { hour: boolean, ... }, ... }
        """
        return await self._get_weekly_availability_sync(court_id, start_date, end_date)
