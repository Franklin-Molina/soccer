from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class UserWebSocketNotifier:
    def __init__(self):
        self.channel_layer = get_channel_layer()
        self.group_name = 'users_admin'

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

    def notify_user_created(self, user_data):
        self._send_to_group('user_created', {'user': user_data})

    def notify_user_updated(self, user_data):
        self._send_to_group('user_updated', {'user': user_data})

    def notify_user_deleted(self, user_id):
        self._send_to_group('user_deleted', {'user_id': user_id})

user_notifier = UserWebSocketNotifier()
