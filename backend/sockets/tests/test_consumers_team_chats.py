import pytest
from channels.testing import WebsocketCommunicator
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import AccessToken
from django.test import override_settings

from backend.asgi import application
from teams.models import Team, TeamMembership
from sockets.models import Chats

TEST_CHANNEL_LAYERS = {
    "default": {"BACKEND": "channels.layers.InMemoryChannelLayer"}
}


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
@override_settings(CHANNEL_LAYERS=TEST_CHANNEL_LAYERS)
async def test_member_can_connect():
    admin = await sync_create_user("admin")
    team = await sync_create_team(admin)
    await sync_add_membership(admin, team, "admin")
    token = str(AccessToken.for_user(admin))

    communicator = WebsocketCommunicator(
        application, f"/ws/team-chats/{team.id}/?token={token}"
    )
    connected, _ = await communicator.connect()
    assert connected
    await communicator.disconnect()


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
@override_settings(CHANNEL_LAYERS=TEST_CHANNEL_LAYERS)
async def test_send_message_broadcasts_and_saves():
    admin = await sync_create_user("admin")
    team = await sync_create_team(admin)
    await sync_add_membership(admin, team, "admin")
    token = str(AccessToken.for_user(admin))

    communicator = WebsocketCommunicator(
        application, f"/ws/team-chats/{team.id}/?token={token}"
    )
    connected, _ = await communicator.connect()
    assert connected

    await communicator.send_json_to({"message": "hello team"})
    response = await communicator.receive_json_from()

    assert response["message"] == "hello team"
    count = await sync_chat_count()
    assert count == 1

    await communicator.disconnect()


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
@override_settings(CHANNEL_LAYERS=TEST_CHANNEL_LAYERS)
async def test_invalid_payload_returns_error():
    admin = await sync_create_user("admin")
    team = await sync_create_team(admin)
    await sync_add_membership(admin, team, "admin")
    token = str(AccessToken.for_user(admin))

    communicator = WebsocketCommunicator(
        application, f"/ws/team-chats/{team.id}/?token={token}"
    )
    connected, _ = await communicator.connect()
    assert connected

    await communicator.send_to(text_data="not valid json")
    response = await communicator.receive_json_from()
    assert response["error"] == "invalid payload"

    await communicator.disconnect()


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
@override_settings(CHANNEL_LAYERS=TEST_CHANNEL_LAYERS)
async def test_non_member_cannot_connect():
    admin = await sync_create_user("admin")
    outsider = await sync_create_user("outsider")
    team = await sync_create_team(admin)
    await sync_add_membership(admin, team, "admin")
    token = str(AccessToken.for_user(outsider))

    communicator = WebsocketCommunicator(
        application, f"/ws/team-chats/{team.id}/?token={token}"
    )
    connected, _ = await communicator.connect()
    assert not connected
    await communicator.disconnect()


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
@override_settings(CHANNEL_LAYERS=TEST_CHANNEL_LAYERS)
async def test_no_token_rejected():
    admin = await sync_create_user("admin")
    team = await sync_create_team(admin)
    await sync_add_membership(admin, team, "admin")

    communicator = WebsocketCommunicator(
        application, f"/ws/team-chats/{team.id}/"
    )
    connected, _ = await communicator.connect()
    assert not connected
    await communicator.disconnect()


# --- sync DB helpers, wrapped for use inside async tests ---
from channels.db import database_sync_to_async

@database_sync_to_async
def sync_create_user(username):
    return User.objects.create_user(username=username, password="password123")

@database_sync_to_async
def sync_create_team(admin):
    return Team.objects.create(name="Backend", description="Demo", created_by=admin)

@database_sync_to_async
def sync_add_membership(user, team, role):
    return TeamMembership.objects.create(user=user, team=team, role=role)

@database_sync_to_async
def sync_chat_count():
    return Chats.objects.count()