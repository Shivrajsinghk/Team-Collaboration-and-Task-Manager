import string, random
from django.db import models
from django.contrib.auth.models import User
import uuid

def generate_invite_code():
    return uuid.uuid4().hex[:10]

class UserProfile(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('busy', 'Busy'),
        ('offline', 'Offline'),
    ]
    user = models.OneToOneField(User, related_name="profile", on_delete=models.CASCADE)
    profile_picture = models.ImageField(upload_to="profile_pictures/", blank=True, null=True)
    bio = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    last_seen = models.DateTimeField(auto_now=True)
    # about = models.TextField(max_length=300, blank=True, null=True)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}".strip() or self.user.username

class Team(models.Model):
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=50, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="teams_created")
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
        ordering = ['-created_at']

class TeamMembership(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('member', 'Member')
    ]
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='team_memberships')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'team']
        
    def __str__(self):
        return f'{self.user.username} - {self.team.name}({self.role})'

class Task(models.Model):
    STATUS_CHOICE = [
        ('todo', 'To Do'), 
        ('in_progress', 'In Progress'),
        ('done', 'Done')
    ]
    PRIORITY_CHOICE = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High')
    ]    
    title = models.CharField(max_length=100)
    description = models.TextField(max_length=250, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="tasks_created")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    due_date = models.DateTimeField(null=True, blank=True)
    assigned_to = models.ManyToManyField(User, related_name="tasks_assigned")
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="tasks")
    status = models.CharField(max_length=15, choices=STATUS_CHOICE, default='todo')
    priority = models.CharField(max_length=15, choices=PRIORITY_CHOICE, default='medium')

    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-created_at']
        