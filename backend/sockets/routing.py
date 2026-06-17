from django.urls import path
from .consumers import TeamChatsConsumer, PersonalChatsConsumer

websocket_urlpatterns = [
    path('ws/team-chats/<int:team_id>/', TeamChatsConsumer.as_asgi()),
    path('ws/personal-chats/<int:conversation_id>/', PersonalChatsConsumer.as_asgi()),
]
