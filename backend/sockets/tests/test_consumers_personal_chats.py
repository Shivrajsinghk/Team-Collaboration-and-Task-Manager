import pytest
from channels.testing import WebsocketCommunicator
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import AccessToken
from django.test import override_settings

from backend.asgi import application
from sockets.models import PersonalConversation, PersonalMessage

TEST_CHANNEL_LAYERS = {
    "default": {"BACKEND": "channels.layers.InMemoryChannelLayer"}
}


@database_sync_to_async
def sync_create_user(username):
    return User.objects.create_user(username=username, password="password123")

@database_sync_to_async
def sync_create_conversation(*participants):
    convo = PersonalConversation.objects.create()
    convo.participant.add(*participants)
    return convo

@database_sync_to_async
def sync_message_count():
    return PersonalMessage.objects.count()

@database_sync_to_async
def sync_create_message(conversation, sender, message, is_read=False):
    return PersonalMessage.objects.create(
        personal_conversation=conversation, sender=sender, message=message, is_read=is_read
    )

@database_sync_to_async
def sync_unread_count(conversation):
    return PersonalMessage.objects.filter(personal_conversation=conversation, is_read=False).count()


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
@override_settings(CHANNEL_LAYERS=TEST_CHANNEL_LAYERS)
async def test_participant_can_connect():
    user1 = await sync_create_user("user1")
    user2 = await sync_create_user("user2")
    convo = await sync_create_conversation(user1, user2)
    token = str(AccessToken.for_user(user1))

    communicator = WebsocketCommunicator(
        application, f"/ws/personal-chats/{convo.id}/?token={token}"
    )
    connected, _ = await communicator.connect()
    assert connected
    await communicator.disconnect()


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
@override_settings(CHANNEL_LAYERS=TEST_CHANNEL_LAYERS)
async def test_non_participant_cannot_connect():
    user1 = await sync_create_user("user1")
    user2 = await sync_create_user("user2")
    outsider = await sync_create_user("outsider")
    convo = await sync_create_conversation(user1, user2)
    token = str(AccessToken.for_user(outsider))

    communicator = WebsocketCommunicator(
        application, f"/ws/personal-chats/{convo.id}/?token={token}"
    )
    connected, _ = await communicator.connect()
    assert not connected
    await communicator.disconnect()


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
@override_settings(CHANNEL_LAYERS=TEST_CHANNEL_LAYERS)
async def test_send_message():
    user1 = await sync_create_user("user1")
    user2 = await sync_create_user("user2")
    convo = await sync_create_conversation(user1, user2)
    token = str(AccessToken.for_user(user1))

    communicator = WebsocketCommunicator(
        application, f"/ws/personal-chats/{convo.id}/?token={token}"
    )
    connected, _ = await communicator.connect()
    assert connected

    await communicator.send_json_to({"message": "hey there"})
    response = await communicator.receive_json_from()
    assert response["message"] == "hey there"

    count = await sync_message_count()
    assert count == 1

    await communicator.disconnect()


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
@override_settings(CHANNEL_LAYERS=TEST_CHANNEL_LAYERS)
async def test_typing_indicator_broadcasts():
    user1 = await sync_create_user("user1")
    user2 = await sync_create_user("user2")
    convo = await sync_create_conversation(user1, user2)
    token = str(AccessToken.for_user(user1))

    communicator = WebsocketCommunicator(
        application, f"/ws/personal-chats/{convo.id}/?token={token}"
    )
    connected, _ = await communicator.connect()
    assert connected

    await communicator.send_json_to({"type": "typing", "is_typing": True})
    response = await communicator.receive_json_from()
    assert response["type"] == "typing"
    assert response["is_typing"] is True
    assert response["user_id"] == user1.id

    await communicator.disconnect()


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
@override_settings(CHANNEL_LAYERS=TEST_CHANNEL_LAYERS)
async def test_seen_marks_messages_read():
    user1 = await sync_create_user("user1")
    user2 = await sync_create_user("user2")
    convo = await sync_create_conversation(user1, user2)
    await sync_create_message(convo, user2, "unread msg 1")
    await sync_create_message(convo, user2, "unread msg 2")
    token = str(AccessToken.for_user(user1))

    communicator = WebsocketCommunicator(
        application, f"/ws/personal-chats/{convo.id}/?token={token}"
    )
    connected, _ = await communicator.connect()
    assert connected

    await communicator.send_json_to({"type": "seen"})
    response = await communicator.receive_json_from()
    assert response["type"] == "seen"
    assert len(response["message_ids"]) == 2

    remaining_unread = await sync_unread_count(convo)
    assert remaining_unread == 0

    await communicator.disconnect()


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
@override_settings(CHANNEL_LAYERS=TEST_CHANNEL_LAYERS)
async def test_unauthenticated_rejected():
    user1 = await sync_create_user("user1")
    user2 = await sync_create_user("user2")
    convo = await sync_create_conversation(user1, user2)

    communicator = WebsocketCommunicator(
        application, f"/ws/personal-chats/{convo.id}/"
    )
    connected, _ = await communicator.connect()
    assert not connected
    await communicator.disconnect()