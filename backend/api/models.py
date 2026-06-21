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
    about = models.TextField(blank=True, null=True)
    is_online = models.BooleanField(default=False)
    last_seen = models.DateTimeField(null=True, blank=True)
    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    resume = models.FileField(upload_to="resumes/", blank=True, null=True)
    skills = models.TextField(blank=True)
    job_title = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=100, blank=True)
    phone_number = models.IntegerField(blank=True, null=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}".strip() or self.user.username
