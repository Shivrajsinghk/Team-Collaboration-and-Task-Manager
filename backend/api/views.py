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

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user_profile, _ = UserProfile.objects.get_or_create(user=request.user)
    serializer = UserProfileSerializer(user_profile)
    return Response(serializer.data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_public_profile(request, username):
    user_profile = get_object_or_404(
        UserProfile,
        user__username=username
    )
    serializer = PublicUserProfileSerializer(user_profile)
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_search_results(request):
    query = request.GET.get('query', '')
    if not query.strip():
        return Response([])
    users = UserProfile.objects.filter(
        Q(user__username__icontains=query) |
        Q(user__first_name__icontains=query) |
        Q(user__last_name__icontains=query) |
        Q(job_title__icontains=query) |
        Q(location__icontains=query) |
        Q(skills__icontains=query) 
    ).exclude(
        user=request.user
    ).select_related('user')[:10]
    teams = Team.objects.filter(
        Q(name__icontains=query) |
        Q(description__icontains=query)
    )[:10]
    tasks = Task.objects.filter(
        Q(title__icontains=query) |
        Q(description__icontains=query) |
        Q(team__name__icontains=query)
    )[:10]
    user_serializer = PublicUserProfileSerializer(users, many=True)
    team_serializer = TeamSerializer(teams, many=True, context={"request": request})
    task_serializer = TaskSerializer(tasks, many=True)
    return Response({
        "users": user_serializer.data,
        "teams": team_serializer.data,
        "tasks": task_serializer.data,
    })
