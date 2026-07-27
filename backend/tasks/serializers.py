from django.contrib.auth.models import User
from rest_framework import serializers
from teams.models import TeamMembership
from teams.serializers import SimpleUserSerializer
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    created_by = serializers.SerializerMethodField()
    assigned_to = serializers.SerializerMethodField()
    team = serializers.StringRelatedField(read_only=True)
    assigned_to_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True,
        source="assigned_to",
        write_only=True,
    )
    team_id = serializers.IntegerField(
        source="team.id",
        read_only=True
    )
    can_edit = serializers.SerializerMethodField()

    def get_can_edit(self, obj):
        request = self.context["request"]
        membership = TeamMembership.objects.get(
            team=obj.team,
            user=request.user
        )
        return membership.role == "admin"
    
    def get_created_by(self, obj):
        return SimpleUserSerializer(
            obj.created_by,
            context={"team": obj.team, "request": self.context.get("request")},
        ).data

    def get_assigned_to(self, obj):
        return SimpleUserSerializer(
            obj.assigned_to.all(),
            many=True,
            context={"team": obj.team, "request": self.context.get("request")},
        ).data

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "team",
            "team_id",
            "created_by",
            "assigned_to",
            "assigned_to_ids",
            "status",
            "priority",
            "due_date",
            "created_at",
            "updated_at",
            "can_edit"
        ]
        read_only_fields = ["created_at", "updated_at"]

    def validate(self, data):
        user = self.context["request"].user
        team = self.context.get("team") or getattr(self.instance, "team", None)
        assigned_users = data.get("assigned_to", [])
        if team and not TeamMembership.objects.filter(user=user, team=team).exists():
            raise serializers.ValidationError("You are not the part of this team")
        for assigned_user in assigned_users:
            if not TeamMembership.objects.filter(user=assigned_user, team=team).exists():
                raise serializers.ValidationError(
                    {"assigned_to_ids": f"{assigned_user} is not part of the team"}
                )
        return data

class TaskStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ["status"]
