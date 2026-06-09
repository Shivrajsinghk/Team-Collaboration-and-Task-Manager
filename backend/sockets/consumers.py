from channels.generic.websocket import AsyncWebsocketConsumer
from channels.exceptions import StopConsumer
from channels.db import database_sync_to_async
import json
from .models import Chats
from .serializer import ChatsSerializer
from teams.models import TeamMembership

class TeamChatsConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("CONNECTED")
        self.team_id = self.scope["url_route"]['kwargs']['team_id']
        self.group_name = f'team_{self.team_id}'
        is_member = await self.is_team_member()
        if not is_member:
            await self.close()
            return 
        
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        message = data['message']
        chat = await self.save_chat(message)
        await self.channel_layer.group_send(self.group_name, {
            'type': 'chat_message',
            'chat': chat
        })
        print("MESSAGE RECEIVED FROM CLIENT TO SERVER", text_data)

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event['chat']))

    async def disconnect(self, close_code):
        print("DISCONNECTED", close_code)
        await self.channel_layer.group_discard(
            self.group_name, self.channel_name
        )
        raise StopConsumer()

    @database_sync_to_async
    def save_chat(self, message):
        user = self.scope['user']
        chat = Chats.objects.create(
            sender_id=user.id,
            team_id=self.team_id,
            message=message
        )
        return ChatsSerializer(chat).data
    
    @database_sync_to_async
    def is_team_member(self):
        user = self.scope['user']
        print(user)
        print(type(user))
        print(user.id) 
        return TeamMembership.objects.filter(
            user_id=user.id,
            team_id=self.team_id
        ).exists()
