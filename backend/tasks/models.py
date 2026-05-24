from django.contrib.auth.models import User
from django.db import models
from teams.models import Team

class Task(models.Model):
    STATUS_CHOICE = [
        ("todo", "To Do"),
        ("in_progress", "In Progress"),
        ("done", "Done"),
    ]
    PRIORITY_CHOICE = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
    ]

    title = models.CharField(max_length=100)
    description = models.TextField(max_length=250, null=True, blank=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="tasks_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    due_date = models.DateTimeField(null=True, blank=True)
    assigned_to = models.ManyToManyField(User, related_name="tasks_assigned")
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="tasks")
    status = models.CharField(max_length=15, choices=STATUS_CHOICE, default="todo")
    priority = models.CharField(max_length=15, choices=PRIORITY_CHOICE, default="medium")

    def __str__(self):
        return self.title

    class Meta:
        app_label = "api"
        ordering = ["-created_at"]

