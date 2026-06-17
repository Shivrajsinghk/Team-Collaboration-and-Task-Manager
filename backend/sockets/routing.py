from django.urls import path
from .consumers import NotificationsConsumer, TeamChatsConsumer, PersonalChatsConsumer

websocket_urlpatterns = [
    path('ws/team-chats/<int:team_id>/', TeamChatsConsumer.as_asgi()),
    path('ws/personal-chats/<int:conversation_id>/', PersonalChatsConsumer.as_asgi()),
    path('ws/notifications/', NotificationsConsumer.as_asgi()),
]
