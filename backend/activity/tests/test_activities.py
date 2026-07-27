from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APIClient
from teams.models import Team, TeamMembership
from tasks.models import Task
from activity.models import Activity

class ActivityTests(TestCase):
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
        self.task = Task.objects.create(
            title="Build API",
            description="Task",
            team=self.team,
            created_by=self.admin
        )

    def test_list_team_activities(self):
        Activity.objects.create(
            actor=self.admin,
            team=self.team,
            activity_type="task_created"
        )
        response = self.client.get(
            reverse(
                "list_team_activities",
                kwargs={
                    "team_id": self.team.id
                }
            )
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_non_member_cannot_list_team_activities(self):
        response = self.client.post(
            reverse("token_obtain_pair"),
            {
                "username": "outsider",
                "password": "password123"
            }
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {response.data["access"]}"
        )
        response = self.client.get(
            reverse(
                "list_team_activities",
                kwargs={
                    "team_id": self.team.id
                }
            )
        )
        self.assertEqual(response.status_code, 403)

    def test_list_task_activities(self):
        Activity.objects.create(
            actor=self.admin,
            team=self.team,
            task=self.task,
            activity_type="task_updated"
        )
        response = self.client.get(
            reverse(
                "list_task_activities",
                kwargs={
                    "team_id": self.team.id,
                    "task_id": self.task.id
                }
            )
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_non_member_cannot_list_task_activities(self):
        response = self.client.post(
            reverse("token_obtain_pair"),
            {
                "username": "outsider",
                "password": "password123"
            }
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {response.data["access"]}"
        )
        response = self.client.get(
            reverse(
                "list_task_activities",
                kwargs={
                    "team_id": self.team.id,
                    "task_id": self.task.id
                }
            )
        )
        self.assertEqual(response.status_code, 403)
