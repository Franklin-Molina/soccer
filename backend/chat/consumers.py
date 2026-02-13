import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from matches.models import OpenMatch, MatchParticipant
from .models import ChatMessage
from django.utils import timezone
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from urllib.parse import parse_qs

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.match_id = self.scope['url_route']['kwargs']['match_id']
        self.room_group_name = f'chat_{self.match_id}'

        # El usuario ya viene autenticado por el JWTAuthMiddleware
        user = self.scope.get('user')

        if not user or user.is_anonymous:
            print(f"❌ No valid user for chat {self.match_id}")
            await self.close(code=4001)
            return

        self.user = user

        try:
            # Validar si el partido ya comenzó (REQUERIMIENTO: Chat cerrado al inicio)
            match_started = await self.has_match_started(self.match_id)
            if match_started:
                print(f"❌ Chat {self.match_id} closed because match already started.")
                # Si el partido ya comenzó, no permitimos ni siquiera conectar
                await self.close(code=4004)
                return

            # Validar si es participante o creador
            is_participant = await self.is_user_participant(self.user, self.match_id)
            if not is_participant:
                print(f"❌ User {self.user.username} is not a participant of match {self.match_id}")
                await self.close(code=4003)
                return

            # Unirse al grupo
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            # Si usamos el subprotocolo para el token, debemos aceptarlo
            accepted_subprotocol = self.scope.get('accepted_subprotocol')
            await self.accept(subprotocol=accepted_subprotocol)
           # print(f"✅ User {self.user.username} connected to chat {self.match_id}")

        except (InvalidToken, TokenError) as e:
            print(f"❌ Invalid token error: {e}")
            await self.close(code=4002)
        except Exception as e:
            print(f"❌ Unexpected connection error: {e}")
            await self.close(code=4000)

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
       # print(f"🔌 User disconnected from chat {self.match_id}. Code: {close_code}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            
            # Manejar evento de 'typing'
            if data.get('type') == 'typing':
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'user_typing',
                        'username': self.user.username,
                        'is_typing': data.get('is_typing', False)
                    }
                )
                return

            message = data.get('message')
            if not message:
                return

            # Validar si el partido ya comenzó
            match_started = await self.has_match_started(self.match_id)
            if match_started:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'El partido ya comenzó, el chat está cerrado.'
                }))
                return

            # Guardar mensaje
            saved_msg = await self.save_message(self.user, self.match_id, message)

            # Enviar a todos en el grupo
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'id': saved_msg.id,
                    'message': saved_msg.message,
                    'username': self.user.username,
                    'user_id': self.user.id,
                    'created_at': str(saved_msg.created_at)
                }
            )

            # Notificar al grupo general de matches para el badge de notificación
            await self.channel_layer.group_send(
                'matches',
                {
                    'type': 'chat_notification',
                    'match_id': self.match_id,
                    'message': saved_msg.message,
                    'username': self.user.username,
                }
            )
        except Exception as e:
            print(f"❌ Error receiving message: {e}")

    async def chat_notification(self, event):
        # Este método no hace nada aquí, pero es necesario para que el group_send no falle
        # si algún consumidor de este tipo está escuchando en este grupo.
        # En realidad, el handler está en MatchConsumer.
        pass

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'id': event['id'],
            'message': event['message'],
            'username': event['username'],
            'user_id': event['user_id'],
            'created_at': event['created_at']
        }))

    async def user_typing(self, event):
        # Evitar enviarse a uno mismo el estado de escritura
        if event['username'] != self.user.username:
            await self.send(text_data=json.dumps({
                'type': 'typing',
                'username': event['username'],
                'is_typing': event['is_typing']
            }))

    @database_sync_to_async
    def get_user(self, user_id):
        return User.objects.get(id=user_id)

    @database_sync_to_async
    def is_user_participant(self, user, match_id):
        try:
            match = OpenMatch.objects.get(id=match_id)
            if match.creator == user:
                return True
            return MatchParticipant.objects.filter(match_id=match_id, user=user).exists()
        except OpenMatch.DoesNotExist:
            return False

    @database_sync_to_async
    def has_match_started(self, match_id):
        try:
            match = OpenMatch.objects.get(id=match_id)
            # Requisito: Los mensajes se borran luego de que inicia la hora del partido
            return timezone.now() >= match.start_time
        except OpenMatch.DoesNotExist:
            return True

    @database_sync_to_async
    def save_message(self, user, match_id, message):
        return ChatMessage.objects.create(
            user=user,
            match_id=match_id,
            message=message
        )
