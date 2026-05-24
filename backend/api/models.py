from django.contrib.auth.models import User
from django.db import models
from tasks.models import Task
from teams.models import Team, TeamMembership


class UserProfile(models.Model):
    STATUS_CHOICES = [
        ("active", "Active"),
        ("busy", "Busy"),
        ("offline", "Offline"),
    ]

    user = models.OneToOneField(User, related_name="profile", on_delete=models.CASCADE)
    profile_picture = models.ImageField(upload_to="profile_pictures/", blank=True, null=True)
    bio = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    last_seen = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}".strip() or self.user.username
