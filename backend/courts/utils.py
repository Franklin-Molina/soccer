from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .serializers import CourtSerializer

class CourtWebSocketNotifier:
    """Helper para enviar notificaciones WebSocket sobre canchas"""
    
    def __init__(self):
        self.channel_layer = get_channel_layer()

    def notify_court_created(self, court):
        if not self.channel_layer:
            #print("⚠️ Court Notifier: No channel layer found")
            return
        serializer = CourtSerializer(court)
       # print(f"📢 Notifying Court Created: {court.id}")
        async_to_sync(self.channel_layer.group_send)(
            'courts_list',
            {'type': 'court_created', 'court': serializer.data}
        )

    def notify_court_updated(self, court):
        if not self.channel_layer:
          #  print("⚠️ Court Notifier: No channel layer found")
            return
        serializer = CourtSerializer(court)
      #  print(f"📢 Notifying Court Updated: {court.id}")
        
        # Notificar a la lista general
        async_to_sync(self.channel_layer.group_send)(
            'courts_list',
            {'type': 'court_updated', 'court': serializer.data}
        )
        
        # Notificar al grupo específico de la cancha
        async_to_sync(self.channel_layer.group_send)(
            f'court_{court.id}',
            {'type': 'court_updated', 'court': serializer.data}
        )

    def notify_court_deleted(self, court_id):
        if not self.channel_layer:
          #  print("⚠️ Court Notifier: No channel layer found")
            return
        
       # print(f"📢 Notifying Court Deleted: {court_id}")
        
        # Notificar a la lista general
        async_to_sync(self.channel_layer.group_send)(
            'courts_list',
            {'type': 'court_deleted', 'court_id': court_id}
        )
        
        # Notificar al grupo específico
        async_to_sync(self.channel_layer.group_send)(
            f'court_{court_id}',
            {'type': 'court_deleted', 'court_id': court_id}
        )

# Singleton instance
court_notifier = CourtWebSocketNotifier()
