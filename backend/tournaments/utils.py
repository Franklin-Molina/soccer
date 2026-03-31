from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .serializers import TournamentMatchSerializer, TournamentSerializer

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

    def notify_tournament_created(self, tournament):
        if not self.channel_layer: return
        serializer = TournamentSerializer(tournament)
        async_to_sync(self.channel_layer.group_send)(
            'tournaments_list',
            {'type': 'tournament_created', 'tournament': serializer.data}
        )

    def notify_tournament_updated(self, tournament):
        if not self.channel_layer: return
        serializer = TournamentSerializer(tournament)
        
        # Notificar a la lista general
        async_to_sync(self.channel_layer.group_send)(
            'tournaments_list',
            {'type': 'tournament_updated', 'tournament': serializer.data}
        )
        
        # Notificar al grupo específico del torneo
        async_to_sync(self.channel_layer.group_send)(
            f'tournament_{tournament.id}',
            {'type': 'tournament_updated', 'tournament': serializer.data}
        )

    def notify_tournament_deleted(self, tournament_id):
        if not self.channel_layer: return
        
        # Notificar a la lista general
        async_to_sync(self.channel_layer.group_send)(
            'tournaments_list',
            {'type': 'tournament_deleted', 'tournament_id': tournament_id}
        )
        
        # Notificar al grupo específico
        async_to_sync(self.channel_layer.group_send)(
            f'tournament_{tournament_id}',
            {'type': 'tournament_deleted', 'tournament_id': tournament_id}
        )

# Singleton instance
tournament_notifier = TournamentWebSocketNotifier()
