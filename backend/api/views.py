from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db import transaction
from teams.models import Team
from tasks.models import Task
from .models import UserProfile
from .serializers import PublicUserProfileSerializer, UserProfileSerializer, UsersRegistrationSerializer
from django.shortcuts import get_object_or_404
from django.db.models import Q
from teams.serializers import TeamSerializer
from tasks.serializers import TaskSerializer
from django.db.models import Q, Case, When, IntegerField, F

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user_profile, _ = UserProfile.objects.get_or_create(user=request.user)
    serializer = UserProfileSerializer(user_profile, context={"request": request})
    return Response(serializer.data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_public_profile(request, username):
    user_profile = get_object_or_404(
        UserProfile,
        user__username=username
    )
    serializer = PublicUserProfileSerializer(user_profile, context={"request": request})
    return Response(
        serializer.data,
        status=status.HTTP_200_OK
    )

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([JSONParser, MultiPartParser, FormParser])
@transaction.atomic
def update_user_profile(request):
    user_profile, _ = UserProfile.objects.get_or_create(user=request.user)
    serializer = UserProfileSerializer(
        user_profile,
        data=request.data,
        partial=True,
        context={"request": request},
    )
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_search_results(request):
    TASK_SORT_MAP = {
        "title": ["title"],
        "-title": ["-title"],
        "created_at": ["created_at"],
        "-created_at": ["-created_at"],
        "due_date": [F("due_date").asc(nulls_last=True)],
        "-due_date": [F("due_date").desc(nulls_last=True)],
    }

    TEAM_SORT_MAP = {
        "name": ["name"],
        "-name": ["-name"],
        "created_at": ["created_at"],
        "-created_at": ["-created_at"],
    }

    PRIORITY_ORDER = Case(
        When(priority="high", then=0),
        When(priority="medium", then=1),
        When(priority="low", then=2),
        output_field=IntegerField(),
    )

    query = request.GET.get('query', '')
    if not query.strip():
        return Response([])
    
    # Users
    users = UserProfile.objects.filter(
        Q(user__username__icontains=query) |
        Q(user__first_name__icontains=query) |
        Q(user__last_name__icontains=query) |
        Q(job_title__icontains=query) |
        Q(location__icontains=query) |
        Q(skills__icontains=query) 
    ).exclude(
        user=request.user
    ).select_related(
        'user'
    ).order_by(
        'user__username'
    )[:10]

    # Teams
    teams_data = Team.objects.filter(    
        Q(name__icontains=query) |
        Q(description__icontains=query),
        memberships__user=request.user
    ).distinct()
    team_sort = request.GET.get('sort_teams')
    if team_sort in TEAM_SORT_MAP:
        teams_data = teams_data.order_by(*TEAM_SORT_MAP[team_sort])
    else:
        teams_data = teams_data.order_by('-created_at')
    teams = teams_data[:10]
    
    # Tasks
    tasks_data = Task.objects.filter(
        Q(title__icontains=query) | 
        Q(description__icontains=query) | 
        Q(team__name__icontains=query),
        team__memberships__user=request.user
    ).distinct()
    status_param = request.GET.get('status')
    if status_param in dict(Task.STATUS_CHOICE):
        tasks_data = tasks_data.filter(status=status_param)

    priority_param = request.GET.get('priority')
    if priority_param in dict(Task.PRIORITY_CHOICE):
        tasks_data = tasks_data.filter(priority=priority_param)

    team_id_param = request.GET.get('team_id')
    if team_id_param:
        tasks_data = tasks_data.filter(team_id=team_id_param)  

    due_before = request.GET.get('due_before') 
    if due_before:
        tasks_data = tasks_data.filter(due_date__lte=due_before)

    due_after = request.GET.get('due_after')
    if due_after:
        tasks_data = tasks_data.filter(due_date__gte=due_after)

    task_sort = request.GET.get('sort_tasks')
    if task_sort in TASK_SORT_MAP:
        tasks_data = tasks_data.order_by(*TASK_SORT_MAP[task_sort])
    elif task_sort == 'priority':
        tasks_data = tasks_data.annotate(_prio=PRIORITY_ORDER).order_by('_prio')
    elif task_sort == '-priority':
        tasks_data = tasks_data.annotate(_prio=PRIORITY_ORDER).order_by('-_prio')
    else:
        tasks_data = tasks_data.order_by('-created_at')  
    tasks = tasks_data[:10]

    user_serializer = PublicUserProfileSerializer(
        users,
        many=True,
        context={"request": request},
    )
    team_serializer = TeamSerializer(teams, many=True, context={"request": request})
    task_serializer = TaskSerializer(tasks, many=True, context={"request": request})
    return Response({
        "users": user_serializer.data,
        "teams": team_serializer.data,
        "tasks": task_serializer.data,
    })
