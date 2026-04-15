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
    from ..serializers import BookingSerializer
    from .websocket_notifier import booking_notifier
    from matches.utils.websocket_notifier import match_notifier
    from matches.serializers import OpenMatchSerializer
    
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

                    # Marcar partido vinculado como EXPIRED si existe
                    if hasattr(booking, 'open_match'):
                        match = booking.open_match
                        match.status = 'EXPIRED'
                        match.save()
                        logger.info(f"Partido {match.id} marcado como EXPIRED por limpieza de reservas.")
                        
                        # Notificar expiración del partido vía WebSocket
                        match_data = OpenMatchSerializer(match).data
                        transaction.on_commit(lambda m_data=match_data: match_notifier.notify_match_updated(m_data))
                    
                    # Notificar vía WebSocket para liberar el espacio en la UI
                    serializer = BookingSerializer(booking)
                    transaction.on_commit(lambda b_data=serializer.data: booking_notifier.notify_booking_updated(b_data))

            except Exception as e:
                logger.error(f"Error al cancelar reserva expirada {booking.id}: {str(e)}")
    
    return count
