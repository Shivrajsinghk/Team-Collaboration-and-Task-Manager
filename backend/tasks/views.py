from django.contrib.auth.models import User
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from activity.services import create_activity
from sockets.utils import create_notification
from teams.models import Team, TeamMembership
from .models import Task
from .serializers import TaskSerializer, TaskStatusSerializer

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def create_task(request, team_id):
    team = get_object_or_404(Team, id=team_id)
    membership = TeamMembership.objects.filter(user=request.user, team=team).exists()
    if not membership:
        return Response(
            {"error": "You are not a member of this team"},
            status=status.HTTP_403_FORBIDDEN,
        )
    serializer = TaskSerializer(data=request.data, context={"request": request, "team": team})
    if serializer.is_valid():
        serializer.save(created_by=request.user, team=team)
        task = serializer.instance
        create_activity(
            actor=request.user,
            team=team,
            task=task,
            activity_type="TASK_CREATED",
        )
        for user in task.assigned_to.all():
            if user == request.user:
                continue
            create_notification(
                user=user,
                notification_type="task_assigned",
                title="New Task Assigned",
                message=f"You have been assigned a new task: {task.title}",
                extra_data={"task_id": task.id, "team_id": team.id},
            )
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_tasks(request, team_id):
    team = get_object_or_404(Team, id=team_id)
    membership = TeamMembership.objects.filter(user=request.user, team=team).exists()
    if not membership:
        return Response(
            {"error": "You are not a member of this team"},
            status=status.HTTP_403_FORBIDDEN,
        )
    tasks = Task.objects.filter(team=team)
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_task(request, team_id, task_id):
    team = get_object_or_404(Team, id=team_id)
    membership = TeamMembership.objects.filter(user=request.user, team=team).exists()
    if not membership:
        return Response(
            {"error": "You are not a member of this team"},
            status=status.HTTP_403_FORBIDDEN,
        )
    task = get_object_or_404(Task, team=team, id=task_id)
    serializer = TaskSerializer(task)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def update_task(request, team_id, task_id):
    team = get_object_or_404(Team, id=team_id)
    membership = TeamMembership.objects.filter(user=request.user, team=team).first()
    if not membership:
        return Response(
            {"error": "You are not a member of this team"},
            status=status.HTTP_403_FORBIDDEN,
        )
    task = get_object_or_404(Task, id=task_id, team=team)
    is_admin = membership.role == "admin"
    is_creator = task.created_by.id == request.user.id
    if not (is_admin or is_creator):
        return Response(
            {"error": "You are not allowed to update the task"},
            status=status.HTTP_403_FORBIDDEN,
        )
    old_title = task.title
    old_priority = task.priority
    old_due_date = task.due_date
    serializer = TaskSerializer(
        task,
        data=request.data,
        partial=True,
        context={"request": request, "team": team},
    )
    if serializer.is_valid():
        serializer.save()
        updated_task = serializer.instance
        if old_priority != updated_task.priority:
            validated_priorities = [choice[0] for choice in Task.PRIORITY_CHOICE]
            if updated_task.priority not in validated_priorities:
                return Response({"error": "Invalid priority"}, status.HTTP_400_BAD_REQUEST)
            create_activity(
                actor=request.user,
                team=team,
                task=task,
                activity_type="TASK_PRIORITY_CHANGED",
                metadata={"old_priority": old_priority, "new_priority": updated_task.priority},
            )
        if old_title != updated_task.title:
            create_activity(
                actor=request.user,
                team=team,
                task=task,
                activity_type="TASK_TITLE_CHANGED",
                metadata={"old_title": old_title, "new_title": updated_task.title},
            )
        if old_due_date != updated_task.due_date:
            create_activity(
                actor=request.user,
                team=team,
                task=task,
                activity_type="TASK_DUE_DATE_CHANGED",
                metadata={"old_due_date": str(old_due_date), "new_due_date": str(updated_task.due_date)},
            )
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_task_status(request, team_id, task_id):
    team = get_object_or_404(Team, id=team_id)
    membership = TeamMembership.objects.filter(team=team, user=request.user).exists()
    if not membership:
        return Response(
            {"error": "You are not a member of this team"},
            status=status.HTTP_403_FORBIDDEN,
        )
    task = get_object_or_404(Task, id=task_id, team=team)
    old_status = task.status
    new_status = request.data.get("status")
    if not new_status:
        return Response({"error": "Status field is required"}, status=status.HTTP_400_BAD_REQUEST)
    validated_statuses = [choice[0] for choice in Task.STATUS_CHOICE]
    if new_status not in validated_statuses:
        return Response({"error": "Invalid Status"}, status.HTTP_400_BAD_REQUEST)
    serializer = TaskStatusSerializer(task, data={"status": new_status}, partial=True)
    if serializer.is_valid():
        serializer.save()
        create_activity(
            actor=request.user,
            team=team,
            task=task,
            activity_type="TASK_STATUS_CHANGED",
            metadata={"old_status": old_status, "new_status": new_status},
        )
        return Response(TaskSerializer(task).data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_task(request, team_id, task_id):
    team = get_object_or_404(Team, id=team_id)
    membership = TeamMembership.objects.filter(user=request.user, team=team).first()
    if not membership:
        return Response({"error": "Not a team member"}, status=status.HTTP_403_FORBIDDEN)
    task = get_object_or_404(Task, id=task_id, team=team)
    is_admin = membership.role == "admin"
    is_creator = task.created_by.id == request.user.id
    if not (is_admin or is_creator):
        return Response(
            {"error": "You are not allowed to delete this task."},
            status=status.HTTP_403_FORBIDDEN,
        )
    create_activity(actor=request.user, team=team, task=task, activity_type="TASK_DELETED")
    task.delete()
    return Response({"message": "Task deleted successfully"}, status=status.HTTP_200_OK)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_member_from_task(request, team_id, member_id, task_id):
    team = get_object_or_404(Team, id=team_id)
    is_admin = TeamMembership.objects.filter(user=request.user, team=team, role="admin").exists()
    task = get_object_or_404(Task, id=task_id, team=team)
    is_creator = task.created_by.id == request.user.id
    if not (is_admin or is_creator):
        return Response(
            {"error": "You are not allowed to remove a member from this task"},
            status=status.HTTP_403_FORBIDDEN,
        )
    member = get_object_or_404(User, id=member_id)
    membership = TeamMembership.objects.filter(user=member, team=team).first()
    if not membership:
        return Response(
            {"error": "User is not the part of this team"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if not task.assigned_to.filter(id=member.id).exists():
        return Response(
            {"error": "User is not assigned to this task"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    task.assigned_to.remove(member)
    create_activity(
        actor=request.user,
        team=team,
        task=task,
        activity_type="TASK_UNASSIGNED",
        metadata={
            "unassigned_member": {
                "id": member.id,
                "username": member.username,
                "first_name": member.first_name,
                "last_name": member.last_name,
            }
        },
    )
    return Response({"message": "Member removed from task successfully"}, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_member_to_task(request, team_id, member_id, task_id):
    team = get_object_or_404(Team, id=team_id)
    is_admin = TeamMembership.objects.filter(user=request.user, team=team, role="admin").exists()
    task = get_object_or_404(Task, id=task_id, team=team)
    is_creator = task.created_by.id == request.user.id
    if not (is_admin or is_creator):
        return Response(
            {"error": "You are not allowed to add a member to this task"},
            status=status.HTTP_403_FORBIDDEN,
        )
    member = get_object_or_404(User, id=member_id)
    membership = TeamMembership.objects.filter(user=member, team=team).first()
    if not membership:
        return Response(
            {"error": "User is not the part of this team"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if task.assigned_to.filter(id=member.id).exists():
        return Response(
            {"error": "User is already assigned to this task"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    task.assigned_to.add(member)
    create_activity(
        actor=request.user,
        team=team,
        task=task,
        activity_type="TASK_ASSIGNED",
        metadata={
            "assigned_member": {
                "id": member.id,
                "username": member.username,
                "first_name": member.first_name,
                "last_name": member.last_name,
            }
        },
    )
    return Response({"message": "Member added to task successfully"}, status=status.HTTP_200_OK)
