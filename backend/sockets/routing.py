from django.urls import path
from .consumers import TeamChatsConsumer

websocket_urlpatterns = [
    path('ws/team-chats/<int:team_id>/', TeamChatsConsumer.as_asgi()),
]
