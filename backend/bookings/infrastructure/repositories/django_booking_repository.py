from typing import List, Optional, Dict, Any
from django.db import transaction
from asgiref.sync import sync_to_async
from django.utils import timezone
from decimal import Decimal

from ...models import Booking # Modelo de Django Booking
from users.models import User # Modelo de Django User
from courts.models import Court # Modelo de Django Court
from payments.models import Payment # Modelo de Django Payment
from ...domain.repositories.booking_repository import IBookingRepository # Interfaz del Dominio

class DjangoBookingRepository(IBookingRepository):
    """
    Implementación del repositorio de reservas que utiliza el ORM de Django.
    Esta clase reside en la capa de Infraestructura.
    """

    @sync_to_async
    def get_all(self, user_id: Optional[int] = None, filters: Optional[Dict[str, Any]] = None) -> List[Booking]:
        queryset = Booking.objects.all().select_related('court', 'user', 'payment')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        if filters:
            # Aplicar filtros adicionales si se proporcionan
            # Ejemplo: queryset = queryset.filter(**filters)
            if 'status' in filters:
                queryset = queryset.filter(status=filters['status'])
            # Añadir más filtros según sea necesario
        return list(queryset)

    @sync_to_async
    def get_by_id(self, booking_id: int, user: Optional[User] = None) -> Optional[Booking]:
        try:
            query = Booking.objects.select_related('court', 'user', 'payment')
            if user: # Si se proporciona un usuario, filtrar por ese usuario
                return query.get(pk=booking_id, user=user)
            return query.get(pk=booking_id) # Si no, obtener por ID (para admin)
        except Booking.DoesNotExist:
            return None

    @sync_to_async
    @transaction.atomic # Asegurar que la creación de la reserva y el pago sea atómica
    def create(self, booking_data: Dict[str, Any]) -> Booking:
        user = booking_data.get('user') # Obtener el usuario de booking_data
        court = booking_data.get('court') # Obtener la instancia de Court directamente
        start_time = booking_data.get('start_time') # Obtener el objeto datetime directamente
        end_time = booking_data.get('end_time') # Obtener el objeto datetime directamente
        payment_percentage = booking_data.get('payment_percentage', 100) # Obtener el porcentaje de pago, por defecto 100%

        if not all([user, court, start_time, end_time]):
            raise ValueError("User, Court instance, start time, and end time are required to create a booking.")

        # La validación de disponibilidad ya se maneja en el serializer,
        # pero se puede mantener aquí como una capa adicional de seguridad si se desea.
        # Sin embargo, para simplificar y evitar duplicación, confiaremos en la validación del serializer.

        # Primero crear la reserva sin el pago (se asignará después)
        booking = Booking.objects.create(
            user=user,
            court=court,
            start_time=start_time,
            end_time=end_time,
            status='PENDING', # Estado inicial de la reserva
            payment=None # Dejar el pago como None por ahora
        )

        # Calcular duración y precio
        duration_hours = (end_time - start_time).total_seconds() / 3600
        total_price = court.price * Decimal(duration_hours)
        
        # Calcular el monto a pagar basado en el porcentaje
        payment_amount = (total_price * Decimal(payment_percentage)) / 100
        
        # Crear el pago, ahora asignando la reserva recién creada
        payment = Payment.objects.create(
            user=user,
            booking=booking, # Asignar la reserva
            amount=payment_amount,
            status='PENDING', # O 'COMPLETED' si se procesa inmediatamente
            method='other' # Cambiado de 'payment_method' a 'method' y de 'ONLINE' a 'other'
        )

        # Actualizar la reserva con la referencia al pago
        booking.payment = payment
        booking.save() # Guardar la reserva actualizada

        return booking

    @sync_to_async
    @transaction.atomic
    def update_status(self, booking_id: int, status: str, user: Optional[User] = None) -> Optional[Booking]:
        try:
            booking = Booking.objects.select_related('payment').get(pk=booking_id)
            
            # Si se proporciona un usuario (no admin), verificar que la reserva le pertenece
            if user and booking.user != user:
                return None # O lanzar un error de permiso

            booking.status = status
            # Lógica adicional si el estado es 'CANCELLED' (ej. reembolsar pago)
            if status == 'CANCELLED' and booking.payment:
                booking.payment.status = 'REFUNDED' # O un estado similar
                booking.payment.save()
            
            booking.save()
            return booking
        except Booking.DoesNotExist:
            return None
