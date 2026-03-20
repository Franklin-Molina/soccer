from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .serializers import TournamentMatchSerializer

class TournamentWebSocketNotifier:
    """Helper para enviar notificaciones WebSocket sobre torneos"""
    
    def __init__(self):
        self.channel_layer = get_channel_layer()

    def notify_match_updated(self, match):
        """Notificar que se actualizó un partido del torneo"""
        if not self.channel_layer:
            return
            
        tournament_id = match.tournament.id
        group_name = f'tournament_{tournament_id}'
        
        # Serializamos el match para enviarlo
        serializer = TournamentMatchSerializer(match)
        
        async_to_sync(self.channel_layer.group_send)(
            group_name,
            {
                'type': 'match_updated',
                'match': serializer.data
            }
        )
        print(f"📢 Notified: Tournament {tournament_id} Match updated {match.id}")

# Singleton instance
tournament_notifier = TournamentWebSocketNotifier()
