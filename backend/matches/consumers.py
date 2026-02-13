# matches/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from urllib.parse import parse_qs

User = get_user_model()

class MatchConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # El usuario ya viene autenticado por el JWTAuthMiddleware
        user = self.scope.get('user')

        if not user or user.is_anonymous:
            await self.close()
            return

        self.room_group_name = 'matches'
        
        # Unirse al grupo de matches
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Si usamos el subprotocolo para el token, debemos aceptarlo
        accepted_subprotocol = self.scope.get('accepted_subprotocol')
        await self.accept(subprotocol=accepted_subprotocol)

    async def disconnect(self, close_code):
        # Salir del grupo
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
      #  print(f"🔌 WebSocket disconnected: {self.channel_name}")

    async def receive(self, text_data):
        """Recibir mensajes del WebSocket (opcional)"""
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type')
        
        print(f"📨 Received message: {message_type}")

    # Handlers para diferentes tipos de eventos
    async def match_created(self, event):
        """Enviar notificación de partido creado"""
        await self.send(text_data=json.dumps({
            'type': 'match_created',
            'match': event['match']
        }))

    async def match_updated(self, event):
        """Enviar notificación de partido actualizado"""
        await self.send(text_data=json.dumps({
            'type': 'match_updated',
            'match': event['match']
        }))

    async def participant_joined(self, event):
        """Enviar notificación de participante que se unió"""
        await self.send(text_data=json.dumps({
            'type': 'participant_joined',
            'match_id': event['match_id'],
            'user': event['user'],
            'participants': event['participants']
        }))

    async def participant_left(self, event):
        """Enviar notificación de participante que se fue"""
        await self.send(text_data=json.dumps({
            'type': 'participant_left',
            'match_id': event['match_id'],
            'user': event['user'],
            'participants': event['participants']
        }))

    async def participant_removed(self, event):
        """Enviar notificación de participante expulsado"""
        await self.send(text_data=json.dumps({
            'type': 'participant_removed',
            'match_id': event['match_id'],
            'user': event['user'],
            'participants': event['participants']
        }))

    async def match_cancelled(self, event):
        """Enviar notificación de partido cancelado"""
        await self.send(text_data=json.dumps({
            'type': 'match_cancelled',
            'match_id': event['match_id'],
            'match': event['match']
        }))

    async def match_deleted(self, event):
        """Enviar notificación de partido eliminado"""
        await self.send(text_data=json.dumps({
            'type': 'match_deleted',
            'match_id': event['match_id']
        }))

    async def chat_notification(self, event):
        """Enviar notificación de nuevo mensaje en el chat"""
        # No enviar la notificación al usuario que envió el mensaje
        user = self.scope.get('user')
        if user and user.is_authenticated and user.username != event['username']:
            await self.send(text_data=json.dumps({
                'type': 'chat_notification',
                'match_id': event['match_id'],
                'message': event['message'],
                'username': event['username']
            }))
