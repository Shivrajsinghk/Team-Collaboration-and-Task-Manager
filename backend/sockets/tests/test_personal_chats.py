from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APIClient
from sockets.models import PersonalConversation, PersonalMessage

class PersonalChatTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            username="user1",
            password="password123"
        )
        self.user2 = User.objects.create_user(
            username="user2",
            password="password123"
        )
        self.user3 = User.objects.create_user(
            username="user3",
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

    def test_create_personal_conversation(self):
        response = self.client.get(
            reverse(
                "get_or_create_personal_conversations_with_new_user",
                kwargs={
                    "other_user_id": self.user2.id
                }
            )
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(
            PersonalConversation.objects.count(),
            1
        )
        conversation = PersonalConversation.objects.first()
        self.assertTrue(
            conversation.participant.filter(id=self.user1.id).exists()
        )
        self.assertTrue(
            conversation.participant.filter(id=self.user2.id).exists()
        )

    def test_existing_conversation_not_duplicated(self):
        self.client.get(
            reverse(
                "get_or_create_personal_conversations_with_new_user",
                kwargs={
                    "other_user_id": self.user2.id
                }
            )
        )
        response = self.client.get(
            reverse(
                "get_or_create_personal_conversations_with_new_user",
                kwargs={
                    "other_user_id": self.user2.id
                }
            )
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            PersonalConversation.objects.count(),
            1
        )

    def test_send_personal_message(self):
        conversation = PersonalConversation.objects.create()
        conversation.participant.add(
            self.user1,
            self.user2
        )
        response = self.client.post(
            reverse(
                "send_personal_message",
                kwargs={
                    "conversation_id": conversation.id
                }
            ),
            {
                "message": "Hello!"
            }
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(
            PersonalMessage.objects.count(),
            1
        )
        self.assertEqual(
            PersonalMessage.objects.first().message,
            "Hello!"
        )

    def test_non_participant_cannot_view_messages(self):
        conversation = PersonalConversation.objects.create()
        conversation.participant.add(
            self.user1,
            self.user2
        )
        response = self.client.post(
            reverse("token_obtain_pair"),
            {
                "username": "user3",
                "password": "password123"
            }
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {response.data['access']}"
        )
        response = self.client.get(
            reverse(
                "list_personal_messages",
                kwargs={
                    "conversation_id": conversation.id
                }
            )
        )
        self.assertEqual(response.status_code, 403)
