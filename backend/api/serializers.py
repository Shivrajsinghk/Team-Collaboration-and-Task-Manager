from rest_framework import serializers
from .models import *
from django.contrib.auth.models import User
    
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

class TeamSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField(read_only=True)
    member_count = serializers.SerializerMethodField()
    is_admin = serializers.SerializerMethodField()
    all_members = serializers.SerializerMethodField()
    task_count = serializers.SerializerMethodField()

    def get_member_count(self, obj):
        return obj.memberships.count()
    
    def get_is_admin(self, obj):
        user = self.context['request'].user
        return obj.memberships.filter(user=user, role="admin").exists()
    
    def get_all_members(self, obj):
        return obj.memberships.all().values('id', 'user__first_name', 'user__last_name', 'user__profile__profile_picture', 'user__id', 'user__username', 'role')

    def get_task_count(self, obj):
        return obj.tasks.count()

    class Meta:
        model = Team
        fields = ["id", "name", 'description', "created_by", "created_at", 'member_count', 'is_admin', 'all_members', 'invite_code', 'task_count']

class TeamMembershipSerializer(serializers.ModelSerializer):
    team = TeamSerializer(read_only = True)
    user = serializers.StringRelatedField(read_only = True)
    invite_code = serializers.CharField(write_only=True)

    class Meta:
        model = TeamMembership
        fields = ["id", "team", "team_id", "user", "role", "joined_at", "invite_code"]

    def create(self, validated_data):
        invite_code = validated_data.pop("invite_code")
        try:
            team = Team.objects.get(invite_code=invite_code)
        except Team.DoesNotExist:
            raise serializers.ValidationError({"error": "Invalid invite code"})
        user = self.context['request'].user
        if TeamMembership.objects.filter(user=user, team=team).exists():
            raise serializers.ValidationError({"error": "Already a member"})
        membership = TeamMembership.objects.create(
            user=user,
            team=team
        )
        return membership

class SimpleUserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    profile_picture = serializers.ImageField(
        source='profile.profile_picture',
        read_only=True
    )
    def get_role(self, obj):
        team = self.context.get('team')
        if not team: 
            return None
        membership = TeamMembership.objects.filter(
            team=team,
            user=obj
        ).first()
        return membership.role if membership else None

    class Meta:
        model = User
        fields = ['id', 'username', 'profile_picture', 'first_name', 'last_name', 'role'] 

class TaskSerializer(serializers.ModelSerializer):
    created_by = serializers.SerializerMethodField()
    assigned_to = serializers.SerializerMethodField()
    team = serializers.StringRelatedField(read_only=True)
    assigned_to_ids = serializers.PrimaryKeyRelatedField(
        queryset = User.objects.all(),
        many = True,
        source = 'assigned_to',
        write_only = True
    )

    def get_created_by(self, obj):
        return SimpleUserSerializer(
            obj.created_by,
            context={'team': obj.team}
        ).data
    
    def get_assigned_to(self, obj):
        return SimpleUserSerializer(
            obj.assigned_to.all(),
            many=True,
            context={'team': obj.team}
        ).data

    class Meta:
        model = Task
        fields = ["id", "title", "description", "team", "created_by", "assigned_to", "assigned_to_ids", "status", "priority", "due_date", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]

    def validate(self, data):
        user = self.context['request'].user
        team = self.context.get("team") or getattr(self.instance, "team", None)
        assigned_users = data.get("assigned_to", [])
        if team and not TeamMembership.objects.filter(user=user, team=team).exists():
            raise serializers.ValidationError("You are not the part of this team")
        for u in assigned_users:
            if not TeamMembership.objects.filter(user=u, team=team).exists():
                raise serializers.ValidationError({
                    "assigned_to_ids": f"{u} is not part of the team"
                })
        return data
    
class TeamMemberDetailsSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    role = serializers.SerializerMethodField()
    assigned_tasks_count = serializers.SerializerMethodField()
    completed_tasks_count = serializers.SerializerMethodField()
    pending_tasks_count = serializers.SerializerMethodField()
    completion_rate = serializers.SerializerMethodField()
    recent_tasks = serializers.SerializerMethodField()

    def get_role(self, obj):
        team = self.context.get("team")
        membership = TeamMembership.objects.filter(
            user=obj,
            team=team
        ).first()
        return membership.role if membership else None

    def get_assigned_tasks_count(self, obj):
        team = self.context.get('team')
        return Task.objects.filter(
            team=team,
            assigned_to=obj
        ).count()

    def get_completed_tasks_count(self, obj):
        team = self.context.get('team')
        return Task.objects.filter(
            team=team,
            assigned_to=obj,
            status="done"
        ).count()

    def get_pending_tasks_count(self, obj):
        team = self.context.get('team')
        return Task.objects.filter(
            team=team,
            assigned_to=obj
        ).exclude(
            status="done"
        ).count()

    def get_completion_rate(self, obj):
        team = self.context.get('team')
        total = Task.objects.filter(
            team=team,
            assigned_to=obj
        ).count()
        completed = Task.objects.filter(
            team=team,
            assigned_to=obj,
            status='done'
        ).count()
        if total == 0:
            return 0
        return round((completed / total) * 100)

    def get_recent_tasks(self, obj):
        team = self.context.get('team')
        tasks = Task.objects.filter(
            team=team,
            assigned_to=obj
        ).order_by('-created_at')[:5]
        return [
            {
                "id": task.id,
                "title": task.title,
                "status": task.status,
                "created_at": task.created_at,
                "due_date": task.due_date
            }
            for task in tasks
        ]

    class Meta:
        model = User
        fields = ['profile', 'role', 'assigned_tasks_count', 'completed_tasks_count', 'pending_tasks_count', 'completion_rate', 'recent_tasks']

class TeamMemberListSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    profile_picture = serializers.ImageField(
        source='profile.profile_picture',
        read_only=True
    )

    def get_role(self, obj):
        team = self.context.get("team")
        membership = TeamMembership.objects.filter(
            team = team,
            user = obj
        ).first()
        return membership.role if membership else None
    
    def get_status(self, obj):
        return obj.profile.status 

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'role', 'status', 'profile_picture']

class TaskStatusSerializer(serializers.ModelSerializer):

    class Meta:
        model = Task
        fields = ['status']