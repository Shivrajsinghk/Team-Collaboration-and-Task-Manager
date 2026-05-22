from .models import Activity
from .serializers import ActivitySerializer 
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from api.models import Team, Task

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_team_activities(request, team_id):
    team = get_object_or_404(Team, id=team_id)
    activities = Activity.objects.filter(
        team=team,
    ).order_by(
        '-created_at'
    )
    serializer = ActivitySerializer(activities, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_task_activities(request, team_id, task_id):
    team = get_object_or_404(Team, id=team_id)
    task = get_object_or_404(Task, team=team, id=task_id)
    activities = Activity.objects.filter(
        team=team,
        task=task,
    ).order_by(
        '-created_at'
    )
    serializer = ActivitySerializer(activities, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

