from django.contrib.auth.models import User
from django.db import IntegrityError, transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from activity.services import create_activity
from .models import Team, TeamMembership
from tasks.models import Task
from .serializers import (
    TeamMemberDetailsSerializer,
    TeamMemberListSerializer,
    TeamMembershipSerializer,
    TeamSerializer,
)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_teams(request):
    memberships = TeamMembership.objects.filter(user=request.user)
    serializer = TeamMembershipSerializer(memberships, many=True, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_team(request, team_id):
    membership = get_object_or_404(TeamMembership, user=request.user, team_id=team_id)
    serializer = TeamMembershipSerializer(membership, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def create_team(request):
    serializer = TeamSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        team = serializer.save(created_by=request.user)
        TeamMembership.objects.create(user=request.user, team=team, role="admin")
        create_activity(actor=request.user, team=team, activity_type="TEAM_CREATED")
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def update_team(request, team_id):
    team = get_object_or_404(Team, id=team_id)
    is_admin = TeamMembership.objects.filter(user=request.user, team=team, role="admin").exists()
    if not is_admin:
        return Response(
            {"error": "You are not allowed to update this team"},
            status=status.HTTP_403_FORBIDDEN,
        )
    serializer = TeamSerializer(team, data=request.data, partial=True, context={"request": request})
    old_name = team.name
    if serializer.is_valid():
        serializer.save()
        updated_team = serializer.instance
        if old_name != updated_team.name:
            create_activity(
                actor=request.user,
                team=team,
                activity_type="TEAM_NAME_CHANGED",
                metadata={"old_name": old_name, "new_name": updated_team.name},
            )
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_team(request, team_id):
    team = get_object_or_404(Team, id=team_id)
    is_admin = TeamMembership.objects.filter(user=request.user, team=team, role="admin").exists()
    if not is_admin:
        return Response(
            {"error": "You are not allowed to delete this team"},
            status=status.HTTP_403_FORBIDDEN,
        )
    team.delete()
    return Response({"message": "Team deleted successfully"}, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def join_team(request):
    serializer = TeamMembershipSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        try:
            serializer.save(user=request.user)
            create_activity(
                actor=request.user,
                team=serializer.instance.team,
                activity_type="NEW_MEMBER_JOINED_TEAM",
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except IntegrityError:
            return Response(
                {"error": "You are already a member of this team"},
                status=status.HTTP_400_BAD_REQUEST,
            )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def leave_team(request, team_id):
    team = get_object_or_404(Team, id=team_id)
    membership = TeamMembership.objects.filter(user=request.user, team=team).first()
    if not membership:
        return Response(
            {"error": "You are not the member of this team"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if membership.role == "admin":
        return Response(
            {"error": "Admin cannot leave team (transfer ownership first)"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    tasks = Task.objects.filter(
        team=team,
        assigned_to=request.user
    )
    for task in tasks:
        task.assigned_to.remove(request.user)
    create_activity(actor=request.user, team=team, activity_type="MEMBER_LEFT_TEAM")
    membership.delete()
    return Response({"message": "You left the team"}, status=status.HTTP_200_OK)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_user_from_team(request, team_id, user_id):
    team = get_object_or_404(Team, id=team_id)
    user = get_object_or_404(User, id=user_id)
    is_admin = TeamMembership.objects.filter(user=request.user, team=team, role="admin").exists()
    if not is_admin:
        return Response(
            {"error": "You are not allowed to remove a user from this team"},
            status=status.HTTP_403_FORBIDDEN,
        )
    if request.user.id == user_id:
        return Response(
            {"error": "You cannot remove yourself. Leave the team."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    membership = TeamMembership.objects.filter(user=user, team=team).first()
    if not membership:
        return Response(
            {"error": "User is not a part of this team"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    tasks = Task.objects.filter(
        team=team,
        assigned_to=user
    )
    for task in tasks:
        task.assigned_to.remove(user)
    membership.delete()
    create_activity(
        actor=request.user,
        team=team,
        activity_type="MEMBER_REMOVED_FROM_TEAM",
        metadata={
            "removed_member": {
                "id": user.id,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
            }
        },
    )
    return Response({"message": "User removed successfully"}, status=status.HTTP_200_OK)

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def promote_member_to_admin(request, team_id, user_id):
    team = get_object_or_404(Team, id=team_id)
    user = get_object_or_404(User, id=user_id)
    is_admin = TeamMembership.objects.filter(user=request.user, team=team, role="admin").exists()
    if not is_admin:
        return Response(
            {"error": "You are not allowed to Promote users in this team"},
            status=status.HTTP_403_FORBIDDEN,
        )
    admin_count = TeamMembership.objects.filter(team=team, role="admin").count()
    if admin_count >= 3:
        return Response({"error": "Maximum admin limit reached"}, status=status.HTTP_400_BAD_REQUEST)
    membership = TeamMembership.objects.filter(user=user, team=team).first()
    if not membership:
        return Response(
            {"error": "User is not a part of this team"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if membership.role == "admin":
        return Response({"error": "User is already an admin"}, status=status.HTTP_400_BAD_REQUEST)
    membership.role = "admin"
    membership.save()
    create_activity(
        actor=request.user,
        team=team,
        activity_type="MEMBER_PROMOTED_IN_TEAM",
        metadata={
            "removed_member": {
                "id": user.id,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
            }
        },
    )
    return Response({"message": "User promoted successfully"}, status=status.HTTP_200_OK)

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def demote_admin_to_member(request, team_id, user_id):
    team = get_object_or_404(Team, id=team_id)
    user = get_object_or_404(User, id=user_id)
    is_admin = TeamMembership.objects.filter(user=request.user, team=team, role="admin").exists()
    if not is_admin:
        return Response(
            {"error": "You are not allowed to Promote users in this team"},
            status=status.HTTP_403_FORBIDDEN,
        )
    membership = TeamMembership.objects.filter(user=user, team=team).first()
    if not membership:
        return Response(
            {"error": "User is not a part of this team"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    admin_count = TeamMembership.objects.filter(team=team, role="admin").count()
    if request.user.id == user.id and admin_count == 1:
        return Response(
            {"error": "You cannot demote yourself because you're the only admin"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if membership.role == "member":
        return Response({"error": "User is already a member"}, status=status.HTTP_400_BAD_REQUEST)
    membership.role = "member"
    membership.save()
    create_activity(
        actor=request.user,
        team=team,
        activity_type="MEMBER_DEMOTED_IN_TEAM",
        metadata={
            "removed_member": {
                "id": user.id,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
            }
        },
    )
    return Response({"message": "User demoted successfully"}, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def members_list(request, team_id):
    team = get_object_or_404(Team, id=team_id)
    if not TeamMembership.objects.filter(user=request.user, team=team).exists():
        return Response(
            {"error": "You are not a part of this team."},
            status=status.HTTP_403_FORBIDDEN,
        )
    members = User.objects.filter(team_memberships__team=team).distinct()
    serializer = TeamMemberListSerializer(members, many=True, context={"team": team})
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def member_details(request, team_id, member_id):
    team = get_object_or_404(Team, id=team_id)
    member = get_object_or_404(User, id=member_id)
    if not TeamMembership.objects.filter(user=request.user, team=team).exists():
        return Response(
            {"error": "You are not a part of this team."},
            status=status.HTTP_403_FORBIDDEN,
        )
    membership = TeamMembership.objects.filter(user=member, team=team).first()
    if not membership:
        return Response(
            {"error": "This member is not a part of this team."},
            status=status.HTTP_403_FORBIDDEN,
        )
    serializer = TeamMemberDetailsSerializer(member, context={"team": team})
    return Response(serializer.data, status=status.HTTP_200_OK)
