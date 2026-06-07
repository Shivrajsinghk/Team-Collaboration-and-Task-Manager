from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile
from PIL import Image

class UserProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', required=True)
    last_name = serializers.CharField(source='user.last_name', required=False)
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    full_name = serializers.SerializerMethodField()
    remove_profile_picture = serializers.BooleanField(write_only=True, required=False, default=False)
    total_tasks = serializers.SerializerMethodField(read_only=True)

    def get_total_tasks(self, obj):
        return obj.user.tasks_assigned.count()

    def get_full_name(self, obj):
        name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return name if name else obj.user.username
    
    def validate_profile_picture(self, file):
        max_size = 5 * 1024 * 1024
        if file.size > max_size:
            raise serializers.ValidationError(
                "File too large"
            )
        try:
            image = Image.open(file)
            image.verify()
        except Exception:
            raise serializers.ValidationError("Invalid image")
        file.seek(0)
        return file

    class Meta:
        model = UserProfile
        fields = ['id', "username", "email", 'first_name', 'last_name', "profile_picture", 'bio', 'status', 'last_seen', "full_name", "remove_profile_picture", 'total_tasks']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        remove_profile_picture = validated_data.pop('remove_profile_picture', False)
        user = instance.user
        user.first_name = user_data.get('first_name', user.first_name)
        user.last_name = user_data.get('last_name', user.last_name)
        user.save()
        if remove_profile_picture:
            if instance.profile_picture:
                instance.profile_picture.delete(save=False)
            instance.profile_picture = None
        else:
            instance.profile_picture = validated_data.get('profile_picture', instance.profile_picture)

        instance.bio = validated_data.get('bio', instance.bio)
        instance.status = validated_data.get('status', instance.status)
        instance.save()
        return instance

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only = True) 

    class Meta:
        model = User
        fields = ["id", "username", "email", "profile"]

class UsersRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only = True)
    confirm_password = serializers.CharField(write_only = True) 

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "confirm_password", 'first_name', 'last_name']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        return data
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(**validated_data)
        return user
    
class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only = True)
