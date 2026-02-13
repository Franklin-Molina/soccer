from typing import List, Optional, Dict, Any
from django.db import transaction
from asgiref.sync import sync_to_async

from ...models import Payment # Modelo de Django Payment
from users.models import User # Modelo de Django User
from bookings.models import Booking # Para asociar con booking si es necesario
from ...domain.repositories.payment_repository import IPaymentRepository # Interfaz del Dominio

class DjangoPaymentRepository(IPaymentRepository):
    """
    Implementación del repositorio de pagos que utiliza el ORM de Django.
    Esta clase reside en la capa de Infraestructura.
    """

    @sync_to_async
    def get_all(self, user: Optional[User] = None, filters: Optional[Dict[str, Any]] = None) -> List[Payment]:
        queryset = Payment.objects.all().select_related('user', 'booking')
        if user:
            queryset = queryset.filter(user=user)
        if filters:
            # Aplicar filtros adicionales si se proporcionan
            if 'status' in filters:
                queryset = queryset.filter(status=filters['status'])
            # Añadir más filtros según sea necesario
        return list(queryset)

    @sync_to_async
    def get_by_id(self, payment_id: int, user: Optional[User] = None) -> Optional[Payment]:
        try:
            query = Payment.objects.select_related('user', 'booking')
            if user: # Si se proporciona un usuario, filtrar por ese usuario
                return query.get(pk=payment_id, user=user)
            return query.get(pk=payment_id) # Si no, obtener por ID (para admin)
        except Payment.DoesNotExist:
            return None

    @sync_to_async
    @transaction.atomic
    def create(self, payment_data: Dict[str, Any], user: User) -> Payment:
        # Asignar el usuario a los datos del pago
        payment_data['user'] = user
        
        # Si se proporciona booking_id, obtener la instancia de Booking
        booking_id = payment_data.pop('booking_id', None)
        if booking_id:
            try:
                booking_instance = Booking.objects.get(pk=booking_id)
                payment_data['booking'] = booking_instance
            except Booking.DoesNotExist:
                raise ValueError(f"Booking with id {booking_id} does not exist.")

        # Crear el pago
        # Esto asume que payment_data ya ha sido validado por un serializador
        # y solo contiene campos que el modelo Payment acepta.
        payment = Payment.objects.create(**payment_data)
        return payment

    @sync_to_async
    @transaction.atomic
    def update_status(self, payment_id: int, status: str, user: Optional[User] = None) -> Optional[Payment]:
        try:
            payment = Payment.objects.get(pk=payment_id)
            
            # Si se proporciona un usuario (no admin), verificar que el pago le pertenece
            if user and payment.user != user:
                return None # O lanzar un error de permiso

            payment.status = status
            payment.save()
            return payment
        except Payment.DoesNotExist:
            return None
