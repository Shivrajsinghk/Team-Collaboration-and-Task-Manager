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
        on_delete=models.PROTECT,
        related_name='user_chats'
    )
    attachments = models.FileField(
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