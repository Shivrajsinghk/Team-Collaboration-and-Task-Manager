from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APIClient

class UserProfileTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="shivraj",
            email="shivraj@gmail.com",
            password="StrongPassword123",
            first_name="Shivraj",
            last_name="Singh"
        )

        response = self.client.post(
            reverse("token_obtain_pair"),
            {
                "username": "shivraj",
                "password": "StrongPassword123"
            }
        )

        self.token = response.data["access"]
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.profile_url = reverse("user_profile")
        self.update_url = reverse("update_user_profile")

    def test_get_profile(self):
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data["username"],
            "shivraj"
        )
        self.assertEqual(
            response.data["email"],
            "shivraj@gmail.com"
        )

    def test_profile_requires_authentication(self):
        client = APIClient()

        response = client.get(self.profile_url)
        self.assertEqual(response.status_code, 403)

    def test_update_profile(self):
        data = {
            "first_name": "Raj",
            "last_name": "Kushwah",
            "bio": "Backend Developer",
            "location": "Indore"
        }
        response = self.client.patch(
            self.update_url,
            data,
            format="json"
        )

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(
            self.user.first_name,
            "Raj"
        )
        self.assertEqual(
            self.user.last_name,
            "Kushwah"
        )
        self.assertEqual(
            self.user.profile.bio,
            "Backend Developer"
        )
        self.assertEqual(
            self.user.profile.location,
            "Indore"
        )

    def test_update_profile_requires_authentication(self):
        client = APIClient()

        response = client.patch(
            self.update_url,
            {},
            format="json"
        )
        self.assertEqual(response.status_code, 403)

    def test_partial_profile_update(self):
        response = self.client.patch(
            self.update_url,
            {
                "bio": "Hello World"
            },
            format="json"
        )

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(
            self.user.profile.bio,
            "Hello World"
        )
        self.assertEqual(
            self.user.first_name,
            "Shivraj"
        )

    def test_get_public_profile(self):
        url = reverse(
            "get_public_profile",
            kwargs={
                "username": "shivraj"
            }
        )

        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data["username"],
            "shivraj"
        )

    def test_public_profile_not_found(self):
        url = reverse(
            "get_public_profile",
            kwargs={
                "username": "unknown"
            }
        )

        response = self.client.get(url)
        self.assertEqual(response.status_code, 404)
    