from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class BookingWebSocketNotifier:
    def __init__(self):
        self.channel_layer = get_channel_layer()
        self.group_name = 'bookings'

    def _send_to_group(self, event_type, data):
        if not self.channel_layer:
            return
            
        async_to_sync(self.channel_layer.group_send)(
            self.group_name,
            {
                'type': event_type,
                **data
            }
        )

    def notify_booking_created(self, booking_data):
        self._send_to_group('booking_created', {'booking': booking_data})

    def notify_booking_updated(self, booking_data):
        self._send_to_group('booking_updated', {'booking': booking_data})

    def notify_booking_cancelled(self, booking_id):
        self._send_to_group('booking_cancelled', {'booking_id': booking_id})

booking_notifier = BookingWebSocketNotifier()
