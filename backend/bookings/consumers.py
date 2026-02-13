import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from urllib.parse import parse_qs

User = get_user_model()

class BookingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # El usuario ya viene autenticado por el JWTAuthMiddleware
        user = self.scope.get('user')

        if not user or user.is_anonymous:
            await self.close()
            return

        self.room_group_name = 'bookings'
        
        # Unirse al grupo de reservas
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Si usamos el subprotocolo para el token, debemos aceptarlo
        accepted_subprotocol = self.scope.get('accepted_subprotocol')
        await self.accept(subprotocol=accepted_subprotocol)

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
      #  print(f"🔌 Booking WebSocket disconnected: {self.channel_name}")

    async def booking_created(self, event):
        await self.send(text_data=json.dumps({
            'type': 'booking_created',
            'booking': event['booking']
        }))

    async def booking_updated(self, event):
        await self.send(text_data=json.dumps({
            'type': 'booking_updated',
            'booking': event['booking']
        }))

    async def booking_cancelled(self, event):
        await self.send(text_data=json.dumps({
            'type': 'booking_cancelled',
            'booking_id': event['booking_id']
        }))
