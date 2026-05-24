import uuid
from django.contrib.auth.models import User
from django.db import models

def generate_invite_code():
    return uuid.uuid4().hex[:10]

class Team(models.Model):
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=50, null=True, blank=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="teams_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    invite_code = models.CharField(max_length=10, null=True, blank=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.invite_code:
            self.invite_code = generate_invite_code()
        super().save(*args, **kwargs)

    class Meta:
        app_label = "api"
        ordering = ["-created_at"]

class TeamMembership(models.Model):
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("member", "Member"),
    ]

    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="memberships")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="team_memberships")
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="member")
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = "api"
        unique_together = ["user", "team"]

    def __str__(self):
        return f"{self.user.username} - {self.team.name}({self.role})"
