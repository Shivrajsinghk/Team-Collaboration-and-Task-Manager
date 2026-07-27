from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APIClient
from teams.models import Team, TeamMembership
from sockets.models import Chats

class TeamChatTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username="admin",
            password="password123"
        )
        self.member = User.objects.create_user(
            username="member",
            password="password123"
        )
        self.outsider = User.objects.create_user(
            username="outsider",
            password="password123"
        )
        response = self.client.post(
            reverse("token_obtain_pair"),
            {
                "username": "admin",
                "password": "password123"
            }
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {response.data['access']}"
        )
        self.team = Team.objects.create(
            name="Backend",
            description="Demo",
            created_by=self.admin
        )
        TeamMembership.objects.create(
            user=self.admin,
            team=self.team,
            role="admin"
        )
        TeamMembership.objects.create(
            user=self.member,
            team=self.team,
            role="member"
        )

    def test_team_member_can_list_chats(self):
        Chats.objects.create(
            team=self.team,
            sender=self.admin,
            message="Hello Team"
        )
        response = self.client.get(
            reverse(
                "list_chats",
                kwargs={
                    "team_id": self.team.id
                }
            )
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(
            response.data[0]["message"],
            "Hello Team"
        )

    def test_non_member_cannot_list_chats(self):
        response = self.client.post(
            reverse("token_obtain_pair"),
            {
                "username": "outsider",
                "password": "password123"
            }
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {response.data['access']}"
        )
        response = self.client.get(
            reverse(
                "list_chats",
                kwargs={
                    "team_id": self.team.id
                }
            )
        )
        self.assertEqual(response.status_code, 403)

    def test_search_team_members(self):
        response = self.client.get(
            reverse(
                "search_team_members",
                kwargs={
                    "team_id": self.team.id
                }
            ),
            {
                "q": "mem"
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(
            response.data[0]["username"],
            "member"
        )

    