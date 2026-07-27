from django.test import TestCase, override_settings
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APIClient
from teams.models import Team, TeamMembership
from tasks.models import Task

class AIAssistantTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="user",
            password="password123"
        )
        self.other = User.objects.create_user(
            username="other",
            password="password123"
        )
        response = self.client.post(
            reverse("token_obtain_pair"),
            {
                "username": "user",
                "password": "password123"
            }
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {response.data['access']}"
        )
        self.team = Team.objects.create(
            name="Backend",
            description="Demo",
            created_by=self.user
        )
        TeamMembership.objects.create(
            user=self.user,
            team=self.team,
            role="admin"
        )
        self.task = Task.objects.create(
            title="Build Backend",
            description="Task",
            team=self.team,
            created_by=self.user
        )

    def test_ai_query_requires_message(self):
        response = self.client.post(
            reverse("ai_query"),
            {},
            format="json"
        )
        self.assertEqual(response.status_code, 400)

    @override_settings(GEMINI_API_KEY=None)
    def test_ai_query_without_api_key(self):
        import os
        old = os.environ.pop("GEMINI_API_KEY", None)
        response = self.client.post(
            reverse("ai_query"),
            {
                "message": "Hello"
            },
            format="json"
        )
        self.assertEqual(response.status_code, 503)
        if old:
            os.environ["GEMINI_API_KEY"] = old

    def test_ai_query_requires_authentication(self):
        self.client.credentials()
        response = self.client.post(
            reverse("ai_query"),
            {
                "message": "Hello"
            }
        )
        self.assertEqual(response.status_code, 403)

    def test_generate_subtasks_requires_title(self):
        response = self.client.post(
            reverse("generate_subtasks"),
            {},
            format="json"
        )
        self.assertEqual(response.status_code, 400)

    def test_generate_subtasks_fallback(self):
        import os
        old = os.environ.pop("GEMINI_API_KEY", None)
        response = self.client.post(
            reverse("generate_subtasks"),
            {
                "title": "Build Authentication"
            },
            format="json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["fallback"])
        self.assertTrue(len(response.data["subtasks"]) > 0)
        if old:
            os.environ["GEMINI_API_KEY"] = old

    def test_create_subtasks(self):
        response = self.client.post(
            reverse("ai-create-subtasks"),
            {
                "parent_task_id": self.task.id,
                "subtasks": [
                    {
                        "title": "API"
                    },
                    {
                        "title": "Frontend"
                    }
                ]
            },
            format="json"
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(
            Task.objects.filter(
                parent_task=self.task
            ).count(),
            2
        )

    def test_parent_task_not_found(self):
        response = self.client.post(
            reverse("ai-create-subtasks"),
            {
                "parent_task_id": 99999,
                "subtasks": [
                    {
                        "title": "API"
                    }
                ]
            },
            format="json"
        )
        self.assertEqual(response.status_code, 404)

    def test_non_member_cannot_create_subtasks(self):
        response = self.client.post(
            reverse("token_obtain_pair"),
            {
                "username": "other",
                "password": "password123"
            }
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {response.data['access']}"
        )
        response = self.client.post(
            reverse("ai-create-subtasks"),
            {
                "parent_task_id": self.task.id,
                "subtasks": [
                    {
                        "title": "API"
                    }
                ]
            },
            format="json"
        )
        self.assertEqual(response.status_code, 403)

    def test_too_many_subtasks(self):
        subtasks = [
            {"title": f"Task {i}"}
            for i in range(21)
        ]
        response = self.client.post(
            reverse("ai-create-subtasks"),
            {
                "parent_task_id": self.task.id,
                "subtasks": subtasks
            },
            format="json"
        )
        self.assertEqual(response.status_code, 400)

    def test_invalid_due_date(self):
        response = self.client.post(
            reverse("ai-create-subtasks"),
            {
                "parent_task_id": self.task.id,
                "subtasks": [
                    {
                        "title": "API",
                        "due_date": "not-a-date"
                    }
                ]
            },
            format="json"
        )
        self.assertEqual(response.status_code, 400)
