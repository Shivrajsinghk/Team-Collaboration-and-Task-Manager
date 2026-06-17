from .models import Chats, Notification, PersonalConversation, PersonalMessage
from rest_framework import serializers
from api.serializers import UserProfileSerializer
import os

class ChatsSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(
        source = 'team.name',
        read_only = True
    )

    team_creator = serializers.CharField(
        source = 'team.created_by.username',
        read_only = True
    )

    team_description = serializers.CharField(
        source = 'team.description',
        read_only = True
    )

    sender = UserProfileSerializer(
        source = 'sender.profile',
        read_only=True
    )

    attachment_name = serializers.SerializerMethodField()
    attachment_url = serializers.SerializerMethodField()
    attachment_is_image = serializers.SerializerMethodField()

    def get_attachment_name(self, obj):
        if not obj.attachment:
            return None
        return os.path.basename(obj.attachment.name)
    
    def get_attachment_url(self, obj):
        if not obj.attachment:
            return None
        request = self.context.get('request')
        url = obj.attachment.url
        return request.build_absolute_uri(url) if request else url

    def get_attachment_is_image(self, obj):
        if not obj.attachment:
            return False
        _ , extension = os.path.splitext(obj.attachment.name.lower())
        return extension in {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'}

    class Meta:
        model = Chats
        fields = ['id', 'team', 'sender', 'attachment', 'attachment_url', 'attachment_name', 'attachment_is_image', 'message', 'created_at', 'team_name', 'team_creator', 'team_description']

class PersonalConversationSerializer(serializers.ModelSerializer):
    participant = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    def get_participant(self, obj):
        profiles = []
        for user in obj.participant.all():
            profiles.append(user.profile)
        # profiles = [user.profile for user in obj.participant.all()]
        return UserProfileSerializer(
            profiles,
            many=True,
            context=self.context
        ).data

    def get_last_message(self, obj):
        message = obj.personal_conversation_messages.order_by("-created_at").first()
        if not message:
            return None
        return {
            "id": message.id,
            "message": message.message,
            "sender": message.sender.username,
            "created_at": message.created_at,
        }

    class Meta:
        model = PersonalConversation
        fields = ['id', 'participant', 'created_at', 'updated_at', 'last_message']

class PersonalMessageSerializer(serializers.ModelSerializer):
    attachment_name = serializers.SerializerMethodField()
    attachment_url = serializers.SerializerMethodField()
    attachment_is_image = serializers.SerializerMethodField()
    
    sender = UserProfileSerializer(
        source='sender.profile',
        read_only=True
    )

    def get_attachment_name(self, obj):
        if not obj.attachment:
            return None
        return os.path.basename(obj.attachment.name)
    
    def get_attachment_url(self, obj):
        if not obj.attachment:
            return None
        request = self.context.get('request')
        url = obj.attachment.url
        return request.build_absolute_uri(url) if request else url

    def get_attachment_is_image(self, obj):
        if not obj.attachment:
            return False
        _ , extension = os.path.splitext(obj.attachment.name.lower())
        return extension in {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'}

    class Meta:
        model = PersonalMessage
        fields = ['id', 'sender', 'attachment', 'attachment_url', 'attachment_name', 'attachment_is_image', 'message', 'is_read', 'created_at']
        
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'notification_type', 'title', 'message', 'is_read', 'created_at', 'extra_data']