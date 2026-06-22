from channels.generic.websocket import AsyncWebsocketConsumer
from channels.exceptions import StopConsumer
from channels.db import database_sync_to_async
import json
from .models import Chats, PersonalConversation, PersonalMessage
from .serializer import ChatsSerializer, PersonalMessageSerializer
from teams.models import TeamMembership
from api.models import UserProfile
from django.utils import timezone

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
        # We return ChatsSerializer(chat).data because WebSockets, Redis channel layers, and APIs need plain serializable data (dict/JSON). A Django model instance (chat) cannot be safely transmitted directly. 
    
    @database_sync_to_async
    def is_team_member(self):
        user = self.scope['user']
        return TeamMembership.objects.filter(
            user_id=user.id,
            team_id=self.team_id
        ).exists()

class PersonalChatsConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("Connected")
        user = self.scope['user']
        if not user.is_authenticated:
            await self.close()
            return 
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        is_participant = await self.is_participant()
        if not is_participant:
            await self.close()
            return
        self.group_name = f'conversation_{self.conversation_id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        if data.get('type') == 'seen':
            seen_ids = await self.mark_seen()
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'messages_seen',
                    'seen_by': self.scope['user'].id,
                    'message_ids': seen_ids
                }
            )
            return
        if data.get('type') == 'typing':
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'typing_indicator',
                    'user_id': self.scope['user'].id,
                    'is_typing': data.get('is_typing', False)
                }
            )
            return
        message = data['message']
        chat = await self.save_chat(message)
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message',
                'chat': chat
            }
        )
        print("Message received from Client to Server")
    
    async def messages_seen(self, event):
        await self.send(text_data=json.dumps({
            'type': 'seen',
            'seen_by': event['seen_by'],
            'message_ids': event['message_ids']
        }))

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event['chat']))

    async def typing_indicator(self, event):
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'user_id': event['user_id'],
            'is_typing': event['is_typing']
        }))

    async def disconnect(self, close_code):
        print('Disconnected')
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        raise StopConsumer()

    @database_sync_to_async
    def save_chat(self, message):
        user = self.scope['user']
        conversation = PersonalConversation.objects.get(id=self.conversation_id)
        chat = PersonalMessage.objects.create(
            sender=user,
            message=message,
            personal_conversation=conversation
        )
        return PersonalMessageSerializer(chat).data
    
    @database_sync_to_async
    def is_participant(self):
        user = self.scope["user"]
        return PersonalConversation.objects.filter(
            id=self.conversation_id,
            participant=user
        ).exists()

    @database_sync_to_async
    def mark_seen(self):
        messages = PersonalMessage.objects.filter(
            personal_conversation_id=self.conversation_id,
            is_read=False
        ).exclude(
            sender=self.scope['user']
        )
        print("UNREAD:", list(messages.values('id', 'sender_id', 'is_read')))
        ids = list(messages.values_list('id', flat=True))
        messages.update(is_read=True)
        return ids

class NotificationsConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("Connected")
        user = self.scope['user']
        if not user.is_authenticated:
            await self.close()
            return
        self.group_name = f'notifications_{user.id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)  
        await self.set_online_status(True)
        await self.accept()
    
    async def send_notification(self, event):
        await self.send(text_data=json.dumps(event['notification']))

    async def disconnect(self, close_code):
        print("Disconnected")
        await self.set_online_status(False)
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
        raise StopConsumer()

    @database_sync_to_async
    def set_online_status(self, status):
        user = self.scope['user']
        UserProfile.objects.filter(user_id=user.id).update(
            last_seen = timezone.now(),
            is_online = status
        )
