from .models import Activity
from rest_framework import serializers
from django.contrib.auth.models import User
from tasks.models import Task
from teams.models import Team

class UserActivitySerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(read_only=True, source='profile.profile_picture')
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'username', 'profile_picture']

class TeamActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['id', 'name']

class TaskActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'status', 'priority']

class ActivitySerializer(serializers.ModelSerializer):
    actor = UserActivitySerializer(read_only=True)
    team = TeamActivitySerializer(read_only=True)
    task = TaskActivitySerializer(read_only=True)

    class Meta:
        model = Activity
        fields = ['id', 'actor', 'team', 'task', 'activity_type', 'metadata', 'created_at']
