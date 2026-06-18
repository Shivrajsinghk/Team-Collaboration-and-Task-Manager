from django.db import models
from teams.models import Team
from django.contrib.auth.models import User

class Chats(models.Model):
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='team_chats'
    )
    sender = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='user_chats'
    )
    attachment = models.FileField(
        upload_to="team_chat_attachments/",
        null=True,
        blank=True
    )
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta: 
        ordering = ['created_at']
    
    def __str__(self):
        return self.sender.username

class PersonalConversation(models.Model):
    participant = models.ManyToManyField(
        User,
        related_name='user_personal_conversations'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class PersonalMessage(models.Model):
    personal_conversation = models.ForeignKey(
        PersonalConversation,
        on_delete=models.CASCADE,
        related_name="personal_conversation_messages"
    )
    sender = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='user_messages'
    )
    attachment = models.FileField(
        upload_to="personal_chat_attachments/",
        null=True,
        blank=True
    )
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        sender = self.sender.username if self.sender else 'Deleted User'
        return f'{sender} sent {self.message[:20]}'

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('task_assigned', 'Task Assigned'),
        ('teamchat_new_attachment_uploaded', 'Teamchat New Attachment Uploaded'),
        ('team_member_joined', 'Team Member Joined'),
        ('team_member_left', 'Team Member Left'),
        ('team_member_removed', 'Team Member Removed'),
    ]
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(
        max_length=50,
        choices=NOTIFICATION_TYPES
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)    
    created_at = models.DateTimeField(auto_now_add=True)
    extra_data = models.JSONField(
        default=dict,
        blank=True
    )

    def __str__(self):
        return self.title  
    