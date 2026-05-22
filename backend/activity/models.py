from django.db import models
from django.contrib.auth.models import User
from api.models import Team, Task

class Activity(models.Model):
    ACTION_CHOICES = [
        ('TASK_CREATED', 'Task Created'),
        ('TASK_DELETED', 'Task Deleted'),
        ('TASK_STATUS_CHANGED', 'Task Status Changed'),
        ('TASK_PRIORITY_CHANGED', 'Task Priority Changed'),
        ('TASK_ASSIGNED', 'Task Assigned'),
        ('TASK_UNASSIGNED', 'Task Unassigned'),
        ('TASK_TITLE_CHANGED', 'Task Title Changed'),
        ('TASK_DUE_DATE_CHANGED', 'Task Due Date Changed'),
        ('TEAM_NAME_CHANGED', 'Team Name Changed'),
        ('NEW_MEMBER_JOINED_TEAM', 'New Member Joined Team'),
        ('MEMBER_LEFT_TEAM', 'Member Left Team'),
        ('MEMBER_REMOVED_FROM_TEAM', 'Member Removed From Team'),
        ('MEMBER_PROMOTED_IN_TEAM', 'Member Promoted in Team'),
        ('MEMBER_DEMOTED_IN_TEAM', 'Member Demoted in Team'),
        ('TEAM_CREATED', 'Team Created'),
    ]
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='user_activities', null=True, blank=True)
    team = models.ForeignKey(Team, on_delete=models.SET_NULL, related_name='team_activities', null=True, blank=True)
    task = models.ForeignKey(Task, on_delete=models.SET_NULL, related_name='task_activities', null=True, blank=True) 
    activity_type = models.CharField(choices=ACTION_CHOICES, max_length=50)
    metadata = models.JSONField(blank=True, default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['team', '-created_at']),
            models.Index(fields=['task', '-created_at']),
            models.Index(fields=['actor', '-created_at']),
            models.Index(fields=['team', 'activity_type', '-created_at'])
        ]

    def __str__(self):
        actor_username = self.actor.username if self.actor else "Default User"
        return f'{actor_username} - {self.activity_type}'
