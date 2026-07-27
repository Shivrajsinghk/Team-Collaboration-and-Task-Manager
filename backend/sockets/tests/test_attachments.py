from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APIClient
from django.core.files.uploadedfile import SimpleUploadedFile
from teams.models import Team, TeamMembership
from sockets.models import Chats

class AttachmentTests(TestCase):
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

    def test_upload_team_attachment(self):
        file = SimpleUploadedFile(
            "hello.txt",
            b"Hello World",
            content_type="text/plain"
        )
        response = self.client.post(
            reverse(
                "upload_chat_attachments",
                kwargs={
                    "team_id": self.team.id
                }
            ),
            {
                "file": file,
                "message": "Attachment"
            },
            format="multipart"
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(
            Chats.objects.count(),
            1
        )
        self.assertTrue(
            Chats.objects.first().attachment
        )

    def test_non_member_cannot_upload_attachment(self):
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
        file = SimpleUploadedFile(
            "hello.txt",
            b"Hello World",
            content_type="text/plain"
        )
        response = self.client.post(
            reverse(
                "upload_chat_attachments",
                kwargs={
                    "team_id": self.team.id
                }
            ),
            {
                "file": file
            },
            format="multipart"
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(
            Chats.objects.count(),
            0
        )
    