from django.utils import timezone
from datetime import timedelta
from django.db import transaction
import logging

logger = logging.getLogger(__name__)

def cancel_expired_bookings():
    """
    Busca reservas pendientes que hayan superado el tiempo límite (5 min)
    y las marca como expiradas para liberar el cupo.
    """
    from ..models import Booking
    
    expiry_time = timezone.now() - timedelta(minutes=5)     # Tiempo de espera para reservas pedientes a canceladas
    
    # Solo procesamos las que siguen en 'pending'
    expired_bookings = Booking.objects.filter(
        status='pending',
        created_at__lt=expiry_time
    )
    
    count = expired_bookings.count()
    if count > 0:
        logger.info(f"Limpieza de reservas: Cancelando {count} reservas expiradas.")
        
        for booking in expired_bookings:
            try:
                with transaction.atomic():
                    booking.status = 'expired'
                    booking.save()
                    
                    # También marcar pagos pendientes como fallidos
                    booking.payments.filter(status='pending').update(status='failed')
                    
                    # Opcional: Notificar vía WebSocket si es necesario
                    # Pero usualmente la limpieza pasiva se activa por una acción del usuario 
                    # que ya disparará una actualización de la UI.
            except Exception as e:
                logger.error(f"Error al cancelar reserva expirada {booking.id}: {str(e)}")
    
    return count
