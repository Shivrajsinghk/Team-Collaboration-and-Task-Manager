from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APIClient
from sockets.models import Notification

class NotificationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="user1",
            password="password123"
        )
        self.other = User.objects.create_user(
            username="user2",
            password="password123"
        )
        response = self.client.post(
            reverse("token_obtain_pair"),
            {
                "username": "user1",
                "password": "password123"
            }
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {response.data['access']}"
        )

    def test_list_notifications(self):
        Notification.objects.create(
            user=self.user,
            notification_type="mention",
            title="Mention",
            message="You were mentioned."
        )
        Notification.objects.create(
            user=self.user,
            notification_type="task",
            title="Task Assigned",
            message="New task assigned."
        )
        response = self.client.get(
            reverse("list_notifications")
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            len(response.data),
            2
        )

    def test_mark_notification_read(self):
        notification = Notification.objects.create(
            user=self.user,
            notification_type="mention",
            title="Mention",
            message="You were mentioned."
        )
        response = self.client.patch(
            reverse(
                "mark_notification_read",
                kwargs={
                    "notification_id": notification.id
                }
            )
        )
        self.assertEqual(response.status_code, 200)
        notification.refresh_from_db()
        self.assertTrue(notification.is_read)

    def test_cannot_mark_other_users_notification(self):
        notification = Notification.objects.create(
            user=self.other,
            notification_type="mention",
            title="Mention",
            message="Hello"
        )
        response = self.client.patch(
            reverse(
                "mark_notification_read",
                kwargs={
                    "notification_id": notification.id
                }
            )
        )
        self.assertEqual(response.status_code, 404)
        notification.refresh_from_db()
        self.assertFalse(notification.is_read)
