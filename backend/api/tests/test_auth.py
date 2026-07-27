from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APIClient

class UserRegistrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("user_register")

    def test_user_registration_success(self):
        data = {
            "username": "shivraj",
            "email": "shivraj@gmail.com",
            "password": "StrongPassword123",
            "confirm_password": "StrongPassword123",
            "first_name": "Shivraj",
            "last_name": "Singh"
        }

        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(User.objects.count(), 1)
        user = User.objects.get(username="shivraj")
        self.assertEqual(user.email, "shivraj@gmail.com")
        self.assertTrue(user.check_password("StrongPassword123"))

    def test_passwords_do_not_match(self):
        data = {
            "username": "shivraj",
            "email": "shivraj@gmail.com",
            "password": "abc12345",
            "confirm_password": "xyz12345",
            "first_name": "Shivraj"
        }

        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(User.objects.count(), 0)

    def test_duplicate_username(self):
        User.objects.create_user(
            username="shivraj",
            email="first@gmail.com",
            password="password123"
        )

        data = {
            "username": "shivraj",
            "email": "second@gmail.com",
            "password": "password123",
            "confirm_password": "password123",
            "first_name": "Shivraj"
        }

        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(User.objects.count(), 1)

    def test_username_is_required(self):
        data = {
            "email": "shivraj@gmail.com",
            "password": "password123",
            "confirm_password": "password123",
            "first_name": "Shivraj"
        }

        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(User.objects.count(), 0)

    def test_duplicate_email(self):
        User.objects.create_user(
            username="user1",
            email="shivraj@gmail.com",
            password="password123"
        )

        data = {
            "username": "user2",
            "email": "shivraj@gmail.com",
            "password": "password123",
            "confirm_password": "password123",
            "first_name": "Shivraj"
        }

        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(User.objects.count(), 1)
    