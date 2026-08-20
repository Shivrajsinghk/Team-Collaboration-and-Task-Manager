import pytest
import asyncio
from channels.testing import WebsocketCommunicator
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import AccessToken
from django.test import override_settings

from backend.asgi import application
from api.models import UserProfile

TEST_CHANNEL_LAYERS = {
    "default": {"BACKEND": "channels.layers.InMemoryChannelLayer"}
}


@database_sync_to_async
def sync_create_user(username):
    return User.objects.create_user(username=username, password="password123")

@database_sync_to_async
def sync_get_profile(user):
    return UserProfile.objects.get(user_id=user.id)

@database_sync_to_async
def sync_refresh(profile):
    profile.refresh_from_db()
    return profile


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
@override_settings(CHANNEL_LAYERS=TEST_CHANNEL_LAYERS)
async def test_authenticated_user_can_connect_and_goes_online():
    user = await sync_create_user("user1")
    token = str(AccessToken.for_user(user))

    communicator = WebsocketCommunicator(
        application, f"/ws/notifications/?token={token}"
    )
    connected, _ = await communicator.connect()
    assert connected

    profile = await sync_get_profile(user)
    profile = await sync_refresh(profile)
    assert profile.is_online is True
    assert profile.active_connections == 1

    await communicator.disconnect()


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
@override_settings(CHANNEL_LAYERS=TEST_CHANNEL_LAYERS)
async def test_unauthenticated_rejected():
    communicator = WebsocketCommunicator(application, "/ws/notifications/")
    connected, _ = await communicator.connect()
    assert not connected
    await communicator.disconnect()


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
@override_settings(CHANNEL_LAYERS=TEST_CHANNEL_LAYERS)
async def test_disconnect_decrements_and_goes_offline():
    user = await sync_create_user("user1")
    token = str(AccessToken.for_user(user))

    communicator = WebsocketCommunicator(
        application, f"/ws/notifications/?token={token}"
    )
    connected, _ = await communicator.connect()
    assert connected

    profile = await sync_get_profile(user)
    await communicator.disconnect()

    profile = await sync_refresh(profile)
    assert profile.active_connections == 0
    assert profile.is_online is False


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
@override_settings(CHANNEL_LAYERS=TEST_CHANNEL_LAYERS)
async def test_multiple_tabs_stays_online_until_all_closed():
    # Simulates a user with two browser tabs open (two WS connections)
    user = await sync_create_user("user1")
    token = str(AccessToken.for_user(user))

    comm1 = WebsocketCommunicator(application, f"/ws/notifications/?token={token}")
    connected1, _ = await comm1.connect()
    assert connected1

    comm2 = WebsocketCommunicator(application, f"/ws/notifications/?token={token}")
    connected2, _ = await comm2.connect()
    assert connected2

    profile = await sync_get_profile(user)
    profile = await sync_refresh(profile)
    assert profile.active_connections == 2
    assert profile.is_online is True

    # close one tab — should still be online
    await comm1.disconnect()
    profile = await sync_refresh(profile)
    assert profile.active_connections == 1
    assert profile.is_online is True

    # close the second tab — now offline
    await comm2.disconnect()
    profile = await sync_refresh(profile)
    assert profile.active_connections == 0
    assert profile.is_online is False


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
@override_settings(CHANNEL_LAYERS=TEST_CHANNEL_LAYERS)
async def test_active_connections_never_goes_negative():
    # Guards the max(0, ...) floor in set_online_status
    user = await sync_create_user("user1")
    token = str(AccessToken.for_user(user))

    communicator = WebsocketCommunicator(application, f"/ws/notifications/?token={token}")
    connected, _ = await communicator.connect()
    assert connected
    await communicator.disconnect()

    profile = await sync_get_profile(user)
    profile = await sync_refresh(profile)
    assert profile.active_connections == 0
