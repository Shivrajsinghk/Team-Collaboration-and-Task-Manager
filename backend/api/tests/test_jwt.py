from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APIClient

class JWTAuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.login_url = reverse("token_obtain_pair")
        self.refresh_url = reverse("token_refresh")

        self.user = User.objects.create_user(
            username="shivraj",
            email="shivraj@gmail.com",
            password="StrongPassword123"
        )

    def test_valid_login_returns_tokens(self):
        data = {
            "username": "shivraj",
            "password": "StrongPassword123"
        }

        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_invalid_password(self):
        data = {
            "username": "shivraj",
            "password": "WrongPassword"
        }

        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, 401)

    def test_invalid_username(self):
        data = {
            "username": "unknown",
            "password": "StrongPassword123"
        }

        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, 401)

    def test_refresh_token_returns_new_access_token(self):
        login_response = self.client.post(
            self.login_url,
            {
                "username": "shivraj",
                "password": "StrongPassword123"
            }
        )

        refresh = login_response.data["refresh"]
        response = self.client.post(
            self.refresh_url,
            {
                "refresh": refresh
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)

    def test_invalid_refresh_token(self):
        response = self.client.post(
            self.refresh_url,
            {
                "refresh": "invalidtoken"
            }
        )

        self.assertEqual(response.status_code, 401)

    