from django.contrib.auth.models import User
from rest_framework import serializers
from api.serializers import UserProfileSerializer
from tasks.models import Task
from .models import Team, TeamMembership


class TeamSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField(read_only=True)
    member_count = serializers.SerializerMethodField()
    is_admin = serializers.SerializerMethodField()
    all_members = serializers.SerializerMethodField()
    task_count = serializers.SerializerMethodField()

    def get_member_count(self, obj):
        return obj.memberships.count()

    def get_is_admin(self, obj):
        user = self.context["request"].user
        return obj.memberships.filter(user=user, role="admin").exists()

    def get_all_members(self, obj):
        return obj.memberships.all().values(
            "id",
            "user__first_name",
            "user__last_name",
            "user__profile__profile_picture",
            "user__id",
            "user__username",
            "role",
            "user__profile__is_online",  
            "user__profile__last_seen",
        )

    def get_task_count(self, obj):
        return obj.tasks.count()

    class Meta:
        model = Team
        fields = [
            "id",
            "name",
            "description",
            "created_by",
            "created_at",
            "member_count",
            "is_admin",
            "all_members",
            "invite_code",
            "task_count",
        ]

class TeamMembershipSerializer(serializers.ModelSerializer):
    team = TeamSerializer(read_only=True)
    user = serializers.StringRelatedField(read_only=True)
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
        user = self.context["request"].user
        if TeamMembership.objects.filter(user=user, team=team).exists():
            raise serializers.ValidationError({"error": "Already a member"})
        return TeamMembership.objects.create(user=user, team=team)

class SimpleUserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    profile_picture = serializers.ImageField(
        source="profile.profile_picture",
        read_only=True,
    )

    def get_role(self, obj):
        team = self.context.get("team")
        if not team:
            return None
        membership = TeamMembership.objects.filter(team=team, user=obj).first()
        return membership.role if membership else None

    class Meta:
        model = User
        fields = ["id", "username", "profile_picture", "first_name", "last_name", "role"]

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
        membership = TeamMembership.objects.filter(user=obj, team=team).first()
        return membership.role if membership else None

    def get_assigned_tasks_count(self, obj):
        team = self.context.get("team")
        return Task.objects.filter(team=team, assigned_to=obj).count()

    def get_completed_tasks_count(self, obj):
        team = self.context.get("team")
        return Task.objects.filter(team=team, assigned_to=obj, status="done").count()

    def get_pending_tasks_count(self, obj):
        team = self.context.get("team")
        return Task.objects.filter(team=team, assigned_to=obj).exclude(status="done").count()

    def get_completion_rate(self, obj):
        team = self.context.get("team")
        total = Task.objects.filter(team=team, assigned_to=obj).count()
        completed = Task.objects.filter(team=team, assigned_to=obj, status="done").count()
        if total == 0:
            return 0
        return round((completed / total) * 100)

    def get_recent_tasks(self, obj):
        team = self.context.get("team")
        tasks = Task.objects.filter(team=team, assigned_to=obj).order_by("-created_at")[:5]
        return [
            {
                "id": task.id,
                "title": task.title,
                "status": task.status,
                "created_at": task.created_at,
                "due_date": task.due_date,
            }
            for task in tasks
        ]

    class Meta:
        model = User
        fields = [
            "profile",
            "role",
            "assigned_tasks_count",
            "completed_tasks_count",
            "pending_tasks_count",
            "completion_rate",
            "recent_tasks",
        ]

class TeamMemberListSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    profile_picture = serializers.ImageField(
        source="profile.profile_picture",
        read_only=True,
    )

    def get_role(self, obj):
        team = self.context.get("team")
        membership = TeamMembership.objects.filter(team=team, user=obj).first()
        return membership.role if membership else None

    def get_status(self, obj):
        return obj.profile.status

    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "role", "status", "profile_picture"]
