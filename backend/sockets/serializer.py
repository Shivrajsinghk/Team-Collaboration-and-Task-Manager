from .models import Chats
from rest_framework import serializers
from api.serializers import UserProfileSerializer
import os

class ChatsSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(
        source = 'team.name',
        read_only = True
    )

    team_description = serializers.CharField(
        source = 'team.description',
        read_only = True
    )

    team_creator = serializers.CharField(
        source = 'team.created_by.username',
        read_only = True
    )

    sender = UserProfileSerializer(
        source = 'sender.profile',
        read_only=True
    )
    attachment_url = serializers.SerializerMethodField()
    attachment_name = serializers.SerializerMethodField()
    attachment_is_image = serializers.SerializerMethodField()

    def get_attachment_url(self, obj):
        if not obj.attachments:
            return None
        request = self.context.get('request')
        url = obj.attachments.url
        return request.build_absolute_uri(url) if request else url

    def get_attachment_name(self, obj):
        if not obj.attachments:
            return None
        return os.path.basename(obj.attachments.name)

    def get_attachment_is_image(self, obj):
        if not obj.attachments:
            return False
        _, extension = os.path.splitext(obj.attachments.name.lower())
        return extension in {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'}

    class Meta:
        model = Chats
        fields = [
            'team',
            'sender',
            'attachments',
            'attachment_url',
            'attachment_name',
            'attachment_is_image',
            'message',
            'created_at',
            'team_name',
            'team_creator',
            'team_description',
        ]
