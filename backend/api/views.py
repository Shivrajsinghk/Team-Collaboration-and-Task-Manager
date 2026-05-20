from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.decorators import api_view
from .models import * 
from .serializers import *
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from django.db import transaction


# User 
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user_profile, _ = UserProfile.objects.get_or_create(user=request.user)
    serializer = UserProfileSerializer(user_profile)
    return Response(serializer.data)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
@transaction.atomic
def update_user_profile(request):
    user_profile, _ = UserProfile.objects.get_or_create(user=request.user)
    serializer = UserProfileSerializer(user_profile, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
@transaction.atomic
def user_register(request):
    serializer = UsersRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "User registered successfully", "User": serializer.data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# Team
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_teams(request):
    memberships = TeamMembership.objects.filter(user=request.user)
    serializer = TeamMembershipSerializer(memberships, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_team(request, team_id):
    membership = get_object_or_404(
        TeamMembership,
        user=request.user,
        team_id=team_id
    )
    serializer = TeamMembershipSerializer(membership, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@transaction.atomic
def create_team(request):
    serializer = TeamSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        team = serializer.save(created_by=request.user)
        TeamMembership.objects.create(
            user = request.user,
            team = team,
            role = 'admin'
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_team(request, team_id):
    team = get_object_or_404(Team, id=team_id)
    is_admin = TeamMembership.objects.filter(
        user = request.user,
        team = team,
        role = 'admin'
    ).exists()
    if not is_admin:
        return Response(
        {"error": "You are not allowed to update this team"},
        status=status.HTTP_403_FORBIDDEN
    )
    serializer = TeamSerializer(team, data=request.data, partial=True, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_team(request, team_id):
    team = get_object_or_404(Team, id=team_id)
    is_admin = TeamMembership.objects.filter(
        user = request.user,
        team = team,
        role = 'admin'
    ).exists()
    if not is_admin:
        return Response(
            {"error": "You are not allowed to delete this team"},
            status=status.HTTP_403_FORBIDDEN
        )
    team.delete()
    return Response(
        {"message": "Team deleted successfully"},
        status=status.HTTP_200_OK
    )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_team(request):
    serializer = TeamMembershipSerializer(
        data=request.data, 
        context={'request': request}
    )
    if serializer.is_valid():
        try:
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except IntegrityError:
            return Response(
                {"error": "You are already a member of this team"},
                status=status.HTTP_400_BAD_REQUEST
            )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def leave_team(request, team_id):
    team = get_object_or_404(Team, id=team_id)
    membership = TeamMembership.objects.filter(
        user = request.user,
        team = team
    ).first()
    # Here .first() is used to extract an object from a queryset
    if not membership:
        return Response(
            {"error": "You are not the member of this team"},
            status=status.HTTP_400_BAD_REQUEST
        )
    if membership.role == "admin":
        return Response(
            {"error": "Admin cannot leave team (transfer ownership first)"},
            status=status.HTTP_400_BAD_REQUEST
        )
    membership.delete()
    return Response(
        {"message": "You left the team"},
        status=status.HTTP_200_OK
    )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_user_from_team(request, team_id, user_id):
    team = get_object_or_404(Team, id=team_id)
    user = get_object_or_404(User, id=user_id)
    is_admin = TeamMembership.objects.filter(
        user = request.user,
        team = team,
        role = 'admin'
    ).exists()
    if not is_admin:
        return Response(
            {"error": "You are not allowed to remove a user from this team"},
            status=status.HTTP_403_FORBIDDEN
        )
    if request.user.id == user_id:
        return Response(
            {"error": "You cannot remove yourself. Leave the team."},
            status=status.HTTP_400_BAD_REQUEST
        )
    membership = TeamMembership.objects.filter(
        user = user,
        team = team
    ).first()
    if not membership:
        return Response(
            {"error": "User is not a part of this team"},
            status=status.HTTP_400_BAD_REQUEST
        )
    membership.delete()
    return Response(
        {"message": "User removed successfully"},
        status=status.HTTP_200_OK
    )

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def promote_member_to_admin(request, team_id, user_id):
    team = get_object_or_404(Team, id=team_id)
    user = get_object_or_404(User, id=user_id)
    is_admin = TeamMembership.objects.filter(
        user=request.user,
        team=team,
        role='admin'
    ).exists()
    if not is_admin:
        return Response(
            {"error": "You are not allowed to Promote users in this team"},
            status=status.HTTP_403_FORBIDDEN
        )
    admin_count = TeamMembership.objects.filter(
        team=team,
        role='admin'
    ).count()
    if admin_count >= 3:
        return Response(
            {"error": "Maximum admin limit reached"},
            status=status.HTTP_400_BAD_REQUEST
        )
    membership = TeamMembership.objects.filter(
        user=user,
        team = team
    ).first()
    if not membership:
        return Response(
            {"error": "User is not a part of this team"},
            status=status.HTTP_400_BAD_REQUEST
        )
    if membership.role == 'admin':
        return Response(
            {"error": "User is already an admin"},
            status=status.HTTP_400_BAD_REQUEST
        )
    membership.role='admin'
    membership.save()
    return Response(
        {"message": "User promoted successfully"},
        status=status.HTTP_200_OK
    )

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def demote_admin_to_member(request, team_id, user_id):
    team = get_object_or_404(Team, id=team_id)
    user = get_object_or_404(User, id=user_id)
    is_admin = TeamMembership.objects.filter(
        user=request.user,
        team=team,
        role='admin'
    ).exists()
    if not is_admin:
        return Response(
            {"error": "You are not allowed to Promote users in this team"},
            status=status.HTTP_403_FORBIDDEN
        )
    membership = TeamMembership.objects.filter(
        user=user,
        team = team
    ).first()
    if not membership:
        return Response(
            {"error": "User is not a part of this team"},
            status=status.HTTP_400_BAD_REQUEST
        )
    admin_count = TeamMembership.objects.filter(
        team=team,
        role='admin'
    ).count()
    if request.user.id == user.id and admin_count == 1:
        return Response(
            {"error": "You cannot demote yourself because you're the only admin"},
            status=status.HTTP_400_BAD_REQUEST
        )
    if membership.role == 'member':
        return Response(
            {"error": "User is already a member"},
            status=status.HTTP_400_BAD_REQUEST
        )
    membership.role='member'
    membership.save()
    return Response(
        {"message": "User demoted successfully"},
        status=status.HTTP_200_OK
    )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def members_list(request, team_id):
    team = get_object_or_404(Team, id=team_id)
    if not TeamMembership.objects.filter(
        user=request.user,
        team=team
    ).exists():
        return Response(
            {"error": "You are not a part of this team."},
            status=status.HTTP_403_FORBIDDEN
        )
    members = User.objects.filter(
        team_memberships__team=team
    ).distinct()
    serializer = TeamMemberListSerializer(
        members,
        many=True,
        context={'team': team}
    )
    return Response(
        serializer.data,
        status=status.HTTP_200_OK
    )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def member_details(request, team_id, member_id):
    team = get_object_or_404(Team, id=team_id)
    member = get_object_or_404(User, id=member_id)
    if not TeamMembership.objects.filter(
        user=request.user,
        team=team
    ).exists():
        return Response(
            {"error": "You are not a part of this team."},
            status=status.HTTP_403_FORBIDDEN
        )
    membership = TeamMembership.objects.filter(
        user=member,
        team=team
    ).first()
    if not membership:
        return Response(
            {"error": "This member is not a part of this team."},
            status=status.HTTP_403_FORBIDDEN
        )
    serializer = TeamMemberDetailsSerializer(member, context={'team': team})
    return Response(serializer.data, status=status.HTTP_200_OK)



# Task
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@transaction.atomic
def create_task(request, team_id):
    team = get_object_or_404(Team, id=team_id)
    membership = TeamMembership.objects.filter(
        user=request.user,
        team=team
    ).exists()
    if not membership:
        return Response(
            {"error": "You are not a member of this team"},
            status=status.HTTP_403_FORBIDDEN
        )
    serializer = TaskSerializer(data=request.data, context={'request': request, 'team': team})
    if serializer.is_valid():
        serializer.save(created_by=request.user, team=team)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_tasks(request, team_id):
    team = get_object_or_404(Team, id=team_id)
    membership = TeamMembership.objects.filter(
        user=request.user,
        team=team
    ).exists()
    if not membership:
        return Response(
            {"error": "You are not a member of this team"},
            status=status.HTTP_403_FORBIDDEN
        )
    tasks = Task.objects.filter(
        team=team
    )
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_task(request, team_id, task_id):
    team = get_object_or_404(Team, id=team_id)
    membership = TeamMembership.objects.filter(
        user=request.user,
        team=team
    ).exists()
    if not membership:
        return Response(
            {"error": "You are not a member of this team"},
            status=status.HTTP_403_FORBIDDEN
        )
    task = get_object_or_404(Task, team=team, id=task_id)
    serializer = TaskSerializer(task)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
@transaction.atomic
def update_task(request, team_id, task_id):
    team = get_object_or_404(Team, id=team_id)
    membership = TeamMembership.objects.filter(
        user=request.user,
        team=team
    ).first()
    if not membership:
        return Response(
            {"error": "You are not a member of this team"},
            status=status.HTTP_403_FORBIDDEN
        )
    task = get_object_or_404(Task, id=task_id, team=team)
    is_admin = membership.role == "admin"
    is_creator = task.created_by.id == request.user.id
    if not (is_admin or is_creator):
        return Response(
            {"error": "You are not allowed to update the task"}, 
            status=status.HTTP_403_FORBIDDEN
        )
    serializer = TaskSerializer(
        task, 
        data=request.data, 
        partial=True, 
        context={
            'request': request,
            'team': team
        }
    )
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_task_status(request, team_id, task_id):
    team = get_object_or_404(Team, id=team_id)
    membership = TeamMembership.objects.filter(
        team=team,
        user=request.user
    ).exists()
    if not membership:
        return Response(
            {"error": "You are not a member of this team"},
            status=status.HTTP_403_FORBIDDEN
        )
    task = get_object_or_404(Task, id=task_id, team=team)
    new_status = request.data.get("status")
    if not new_status:
        return Response(
            {"error": "Status field is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    serializer = TaskStatusSerializer(
        task,
        data={"status": new_status},
        partial=True
    )
    if serializer.is_valid():
        serializer.save()
        return Response(TaskSerializer(task).data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_task(request, team_id, task_id):
    team = get_object_or_404(Team, id=team_id)
    membership = TeamMembership.objects.filter(
        user=request.user,
        team=team
    ).first()
    if not membership:
        return Response(
            {"error": "Not a team member"},
            status=status.HTTP_403_FORBIDDEN
        )
    task = get_object_or_404(Task, id=task_id, team=team)
    is_admin = membership.role == "admin"
    is_creator = task.created_by.id == request.user.id
    if not (is_admin or is_creator):
        return Response({"error": "You are not allowed to delete this task."}, status=status.HTTP_403_FORBIDDEN)
    task.delete()
    return Response({"message": "Task deleted successfully"}, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_member_from_task(request, team_id, member_id, task_id):
    team = get_object_or_404(Team, id=team_id)
    is_admin = TeamMembership.objects.filter(
        user = request.user,
        team = team,
        role = 'admin'
    ).exists()
    task = get_object_or_404(Task, id=task_id, team=team)
    is_creator = task.created_by.id == request.user.id
    if not (is_admin or is_creator):
        return Response(
            {"error": "You are not allowed to remove a member from this task"},
            status=status.HTTP_403_FORBIDDEN
        )
    member = get_object_or_404(User, id=member_id)
    membership = TeamMembership.objects.filter(
        user = member,
        team = team
    ).first()
    if not membership:
        return Response(
            {"error": "User is not the part of this team"},
            status=status.HTTP_400_BAD_REQUEST
        )
    if not task.assigned_to.filter(id=member.id).exists():
        return Response(
            {"error": "User is not assigned to this task"},
            status=status.HTTP_400_BAD_REQUEST
        )
    task.assigned_to.remove(member)
    return Response(
        {"message": "Member removed from task successfully"},
        status=status.HTTP_200_OK
    )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_member_to_task(request, team_id, member_id, task_id):
    team = get_object_or_404(Team, id=team_id)
    is_admin = TeamMembership.objects.filter(
        user = request.user,
        team = team,
        role = 'admin'
    ).exists()
    task = get_object_or_404(Task, id=task_id, team=team)
    is_creator = task.created_by.id == request.user.id
    if not (is_admin or is_creator):
        return Response(
            {"error": "You are not allowed to add a member to this task"},
            status=status.HTTP_403_FORBIDDEN
        )
    member = get_object_or_404(User, id=member_id)
    membership = TeamMembership.objects.filter(
        user = member,
        team = team
    ).first()
    if not membership:
        return Response(
            {"error": "User is not the part of this team"},
            status=status.HTTP_400_BAD_REQUEST
        )
    if task.assigned_to.filter(id=member.id).exists():
        return Response(
            {"error": "User is already assigned to this task"},
            status=status.HTTP_400_BAD_REQUEST
        )
    task.assigned_to.add(member)
    return Response(
        {"message": "Member added to task successfully"},
        status=status.HTTP_200_OK
    )
