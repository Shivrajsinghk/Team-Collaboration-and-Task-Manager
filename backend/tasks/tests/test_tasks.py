from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APIClient
from teams.models import Team, TeamMembership
from tasks.models import Task

class TaskTests(TestCase):
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

    def test_create_task(self):
        response = self.client.post(
            reverse(
                "create_task",
                kwargs={"team_id": self.team.id}
            ),
            {
                "title": "Implement JWT",
                "description": "Backend",
                "priority": "high",
                "status": "todo",
                "assigned_to_ids": [self.member.id]
            },
            format="json"
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Task.objects.count(), 1)
        task = Task.objects.first()
        self.assertEqual(task.title, "Implement JWT")
        self.assertTrue(
            task.assigned_to.filter(id=self.member.id).exists()
        )

    def test_list_tasks(self):
        Task.objects.create(
            title="Demo Task",
            description="Demo",
            team=self.team,
            created_by=self.admin
        )
        response = self.client.get(
            reverse(
                "list_tasks",
                kwargs={"team_id": self.team.id}
            )
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_update_task(self):
        task = Task.objects.create(
            title="Old Title",
            description="Demo",
            team=self.team,
            created_by=self.admin
        )

        response = self.client.patch(
            reverse(
                "update_task",
                kwargs={
                    "team_id": self.team.id,
                    "task_id": task.id
                }
            ),
            {
                "title": "New Title"
            },
            format="json"
        )

        self.assertEqual(response.status_code, 200)
        task.refresh_from_db()
        self.assertEqual(task.title, "New Title")

    def test_update_task_status(self):
        task = Task.objects.create(
            title="Demo",
            description="Demo",
            team=self.team,
            created_by=self.admin,
            status="todo"
        )

        response = self.client.patch(
            reverse(
                "update_task_status",
                kwargs={
                    "team_id": self.team.id,
                    "task_id": task.id
                }
            ),
            {
                "status": "done"
            },
            format="json"
        )

        self.assertEqual(response.status_code, 200)
        task.refresh_from_db()
        self.assertEqual(task.status, "done")

    def test_delete_task(self):
        task = Task.objects.create(
            title="Delete Me",
            description="Demo",
            team=self.team,
            created_by=self.admin
        )
        response = self.client.delete(
            reverse(
                "delete_task",
                kwargs={
                    "team_id": self.team.id,
                    "task_id": task.id
                }
            )
        )
        self.assertEqual(response.status_code, 200)
        self.assertFalse(
            Task.objects.filter(id=task.id).exists()
        )

class TaskPermissionTests(TestCase):
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
            title="Backend API",
            description="Demo",
            team=self.team,
            created_by=self.admin
        )

    def test_member_cannot_update_admin_task(self):
        response = self.client.post(
            reverse("token_obtain_pair"),
            {
                "username": "member",
                "password": "password123"
            }
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {response.data['access']}"
        )
        response = self.client.patch(
            reverse(
                "update_task",
                kwargs={
                    "team_id": self.team.id,
                    "task_id": self.task.id
                }
            ),
            {
                "title": "Hacked"
            },
            format="json"
        )
        self.assertEqual(response.status_code, 403)
        self.task.refresh_from_db()
        self.assertEqual(self.task.title, "Backend API")

    def test_member_cannot_delete_admin_task(self):
        response = self.client.post(
            reverse("token_obtain_pair"),
            {
                "username": "member",
                "password": "password123"
            }
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {response.data['access']}"
        )
        response = self.client.delete(
            reverse(
                "delete_task",
                kwargs={
                    "team_id": self.team.id,
                    "task_id": self.task.id
                }
            )
        )
        self.assertEqual(response.status_code, 403)
        self.assertTrue(
            Task.objects.filter(id=self.task.id).exists()
        )

    def test_outsider_cannot_list_tasks(self):
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
                "list_tasks",
                kwargs={
                    "team_id": self.team.id
                }
            )
        )
        self.assertEqual(response.status_code, 403)
