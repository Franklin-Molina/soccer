import json
from channels.generic.websocket import AsyncWebsocketConsumer

class CourtListConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'courts_list'
        if self.channel_layer:
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name') and self.channel_layer:
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def court_created(self, event):
        await self.send(text_data=json.dumps(event))

    async def court_updated(self, event):
        await self.send(text_data=json.dumps(event))

    async def court_deleted(self, event):
        await self.send(text_data=json.dumps(event))

class CourtConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            accepted_subprotocol = self.scope.get('accepted_subprotocol')
            await self.accept(subprotocol=accepted_subprotocol)

            self.court_id = self.scope['url_route']['kwargs'].get('court_id')
            if not self.court_id:
                await self.close()
                return

            self.room_group_name = f'court_{self.court_id}'

            if self.channel_layer:
                await self.channel_layer.group_add(
                    self.room_group_name,
                    self.channel_name
                )
            
        except Exception as e:
            try:
                await self.close()
            except:
                pass

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name') and self.channel_layer:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def court_updated(self, event):
        await self.send(text_data=json.dumps(event))

    async def court_deleted(self, event):
        await self.send(text_data=json.dumps(event))
