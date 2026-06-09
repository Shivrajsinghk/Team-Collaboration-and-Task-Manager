from django.urls import path
from .views import *

urlpatterns = [
    path('<int:team_id>/chats/', list_chats, name="list_chats"),
    path('<int:team_id>/chats/upload/', upload_chat_attachment, name="upload_chat_attachment"),
]
