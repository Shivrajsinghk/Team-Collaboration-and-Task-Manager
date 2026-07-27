from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APIClient
from teams.models import Team, TeamMembership

class TeamTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="admin",
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
        self.create_url = reverse("create_team")
        self.list_url = reverse("list_teams")
        self.join_url = reverse("join_team")

    def test_create_team(self):
        response = self.client.post(
            self.create_url,
            {
                "name": "Backend Team",
                "description": "Testing Team"
            }
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Team.objects.count(), 1)
        team = Team.objects.first()
        self.assertEqual(team.name, "Backend Team")
        self.assertTrue(
            TeamMembership.objects.filter(
                user=self.user,
                team=team,
                role="admin"
            ).exists()
        )

    def test_list_teams(self):
        team = Team.objects.create(
            name="Backend",
            description="Demo",
            created_by=self.user
        )
        TeamMembership.objects.create(
            user=self.user,
            team=team,
            role="admin"
        )

        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_join_team(self):
        owner = User.objects.create_user(
            username="owner",
            password="password123"
        )
        team = Team.objects.create(
            name="Backend",
            description="Demo",
            created_by=owner
        )
        TeamMembership.objects.create(
            user=owner,
            team=team,
            role="admin"
        )
        response = self.client.post(
            self.join_url,
            {
                "invite_code": team.invite_code
            }
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(
            TeamMembership.objects.filter(
                user=self.user,
                team=team
            ).exists()
        )

    def test_join_team_invalid_invite_code(self):
        response = self.client.post(
            self.join_url,
            {
                "invite_code": "INVALID"
            }
        )
        self.assertEqual(response.status_code, 400)

    def test_cannot_join_same_team_twice(self):
        team = Team.objects.create(
            name="Backend",
            description="Demo",
            created_by=self.user
        )
        TeamMembership.objects.create(
            user=self.user,
            team=team,
            role="admin"
        )
        response = self.client.post(
            self.join_url,
            {
                "invite_code": team.invite_code
            }
        )

        self.assertEqual(response.status_code, 400)

class PermissionTest(TestCase):
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
        self.team = Team.objects.create(
            name="Backend Team",
            description="Demo Team",
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

    def test_member_cannot_update_team(self):
        response = self.client.post(
            reverse("token_obtain_pair"),
            {
                "username": "member",
                "password": "password123",
            },
        )
        token = response.data["access"]
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {token}"
        )
        response = self.client.patch(
            reverse("update_team", kwargs={"team_id": self.team.id}),
            {
                "name": "New Team Name"
            },
            format="json",
        )

        self.assertEqual(response.status_code, 403)
        self.team.refresh_from_db()
        self.assertEqual(self.team.name, "Backend Team")

    def test_member_cannot_delete_team(self):
        response = self.client.post(
            reverse("token_obtain_pair"),
            {
                "username": "member",
                "password": "password123",
            },
        )

        token = response.data["access"]
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {token}"
        )
        response = self.client.delete(
            reverse("delete_team", kwargs={"team_id": self.team.id})
        )
        self.assertEqual(response.status_code, 403)
        self.assertTrue(
            Team.objects.filter(id=self.team.id).exists()
        )

    def test_non_member_cannot_view_team(self):
        outsider = User.objects.create_user(
            username="outsider",
            password="password123"
        )
        response = self.client.post(
            reverse("token_obtain_pair"),
            {
                "username": "outsider",
                "password": "password123",
            },
        )
        token = response.data["access"]
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {token}"
        )
        response = self.client.get(
            reverse("list_team", kwargs={"team_id": self.team.id})
        )
        self.assertEqual(response.status_code, 404)
