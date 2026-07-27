from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APIClient
from api.models import UserProfile
from teams.models import Team, TeamMembership
from tasks.models import Task

class SearchTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="shivraj",
            password="password123"
        )
        self.other = User.objects.create_user(
            username="john",
            first_name="John",
            last_name="Doe",
            password="password123"
        )

        profile = self.other.profile
        profile.job_title = "Backend Developer"
        profile.location = "Indore"
        profile.skills = "Python Django"
        profile.save()

        response = self.client.post(
            reverse("token_obtain_pair"),
            {
                "username": "shivraj",
                "password": "password123"
            }
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {response.data['access']}"
        )
        self.team = Team.objects.create(
            name="Backend Team",
            description="Django APIs",
            created_by=self.user
        )
        TeamMembership.objects.create(
            user=self.user,
            team=self.team,
            role="admin"
        )
        self.task = Task.objects.create(
            title="Implement JWT",
            description="Authentication",
            team=self.team,
            created_by=self.user,
            priority="high",
            status="todo"
        )
        self.url = reverse("get_search_results")

    def test_search_returns_results(self):
        response = self.client.get(
            self.url,
            {
                "query": "Backend"
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["users"]), 1)
        self.assertEqual(len(response.data["teams"]), 1)
        self.assertEqual(len(response.data["tasks"]), 1)

    def test_empty_query_returns_empty_list(self):
        response = self.client.get(
            self.url,
            {
                "query": ""
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])

    def test_search_no_results(self):
        response = self.client.get(
            self.url,
            {
                "query": "abcdefxyz"
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["users"]), 0)
        self.assertEqual(len(response.data["teams"]), 0)
        self.assertEqual(len(response.data["tasks"]), 0)

    def test_current_user_not_returned(self):
        self.user.profile.job_title = "Backend"
        self.user.profile.save()

        response = self.client.get(
            self.url,
            {
                "query": "shivraj"
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["users"]), 0)

    def test_search_requires_authentication(self):
        client = APIClient()
        response = client.get(
            self.url,
            {
                "query": "Backend"
            }
        )
        self.assertEqual(response.status_code, 403)

    