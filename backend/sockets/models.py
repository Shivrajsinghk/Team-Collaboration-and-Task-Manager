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
