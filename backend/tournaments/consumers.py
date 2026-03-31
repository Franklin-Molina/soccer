import json
from channels.generic.websocket import AsyncWebsocketConsumer

class TournamentListConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'tournaments_list'
        if self.channel_layer:
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name') and self.channel_layer:
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def tournament_created(self, event):
        await self.send(text_data=json.dumps(event))

    async def tournament_updated(self, event):
        await self.send(text_data=json.dumps(event))

    async def tournament_deleted(self, event):
        await self.send(text_data=json.dumps(event))

class TournamentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            # Primero aceptamos la conexión para evitar errores prematuros en el cliente
            # Manejando posibles subprotocolos (JWT)
            accepted_subprotocol = self.scope.get('accepted_subprotocol')
            await self.accept(subprotocol=accepted_subprotocol)

            self.tournament_id = self.scope['url_route']['kwargs'].get('tournament_id')
            if not self.tournament_id:
                print("⚠️ WebSocket de Torneo: tournament_id no encontrado en la ruta")
                await self.close()
                return

            self.room_group_name = f'tournament_{self.tournament_id}'

            # Join room group
            if self.channel_layer:
                await self.channel_layer.group_add(
                    self.room_group_name,
                    self.channel_name
                )
                # print(f"✅ WebSocket de Torneo {self.tournament_id} conectado: {self.channel_name}")
            
        except Exception as e:
            print(f"❌ Error en conexión WebSocket de Torneo: {e}")
            # Si hay error y no se ha cerrado, intentamos cerrar
            try:
                await self.close()
            except:
                pass

    async def disconnect(self, close_code):
        # Leave room group (solo si llegamos a definir el nombre del grupo)
        if hasattr(self, 'room_group_name') and self.channel_layer:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            # print(f"🔌 WebSocket de Torneo desconectado (Código: {close_code})")

    async def receive(self, text_data):
        """No esperamos recibir nada del cliente por ahora"""
        pass

    async def match_updated(self, event):
        """Enviar notificación de partido actualizado"""
        await self.send(text_data=json.dumps({
            'type': 'match_updated',
            'match': event['match']
        }))

    async def tournament_updated(self, event):
        """Enviar notificación de torneo actualizado"""
        await self.send(text_data=json.dumps(event))

    async def tournament_deleted(self, event):
        """Enviar notificación de torneo eliminado"""
        await self.send(text_data=json.dumps(event))
