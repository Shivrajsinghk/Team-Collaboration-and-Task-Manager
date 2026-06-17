from django.urls import path
from .views import *

urlpatterns = [
    # Team Chat Views
    path(
        '<int:team_id>/chats/', 
        list_chats, 
        name="list_chats"
    ),
    path(
        '<int:team_id>/chats/upload/', 
        upload_chat_attachments, 
        name="upload_chat_attachments"
    ),
    

    # Personal Chat Views
    path(
        'user/<int:other_user_id>/chats/', 
        get_or_create_personal_conversations_with_new_user, 
        name="get_or_create_personal_conversations_with_new_user"
    ),
    path(
        'conversations/',
        list_conversations,
        name="list_conversations"
    ),
    path(
        'chats/<int:conversation_id>/send/',
        send_personal_message,
        name="send_personal_message"
    ),
    path(
        'chats/<int:conversation_id>/',
        list_personal_messages,
        name="list_personal_messages"
    ),
    path(
        'chats/<int:conversation_id>/upload/',
        upload_personal_attachments,
        name="upload_personal_attachments"
    ),
]
