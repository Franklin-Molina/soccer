# matches/utils/websocket_notifier.py
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class MatchWebSocketNotifier:
    """Helper para enviar notificaciones WebSocket sobre partidos"""
    
    def __init__(self):
        self.channel_layer = get_channel_layer()
        self.group_name = 'matches'

    def _send_to_group(self, event_type, data):
        """Enviar un evento al grupo de matches"""
        if not self.channel_layer:
            print("⚠️ Channel layer not configured")
            return
            
        async_to_sync(self.channel_layer.group_send)(
            self.group_name,
            {
                'type': event_type,
                **data
            }
        )

    def notify_match_created(self, match_data):
        """Notificar que se creó un nuevo partido"""
        self._send_to_group('match_created', {
            'match': match_data
        })
        print(f"📢 Notified: Match created {match_data.get('id')}")

    def notify_match_updated(self, match_data):
        """Notificar que se actualizó un partido"""
        self._send_to_group('match_updated', {
            'match': match_data
        })
        print(f"📢 Notified: Match updated {match_data.get('id')}")

    def notify_participant_joined(self, match_id, user_data, participants_data):
        """Notificar que un participante se unió"""
        self._send_to_group('participant_joined', {
            'match_id': match_id,
            'user': user_data,
            'participants': participants_data
        })
        print(f"📢 Notified: Participant joined match {match_id}")

    def notify_participant_left(self, match_id, user_data, participants_data):
        """Notificar que un participante se fue"""
        self._send_to_group('participant_left', {
            'match_id': match_id,
            'user': user_data,
            'participants': participants_data
        })
        print(f"📢 Notified: Participant left match {match_id}")

    def notify_participant_removed(self, match_id, user_data, participants_data):
        """Notificar que un participante fue expulsado"""
        self._send_to_group('participant_removed', {
            'match_id': match_id,
            'user': user_data,
            'participants': participants_data
        })
        print(f"📢 Notified: Participant removed from match {match_id}")

    def notify_match_cancelled(self, match_id, match_data):
        """Notificar que un partido fue cancelado"""
        self._send_to_group('match_cancelled', {
            'match_id': match_id,
            'match': match_data
        })
        print(f"📢 Notified: Match cancelled {match_id}")

    def notify_match_deleted(self, match_id):
        """Notificar que un partido fue eliminado"""
        self._send_to_group('match_deleted', {
            'match_id': match_id
        })
        print(f"📢 Notified: Match deleted {match_id}")


# Singleton instance
match_notifier = MatchWebSocketNotifier()


