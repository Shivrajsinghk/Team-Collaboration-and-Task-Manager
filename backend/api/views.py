from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db import transaction
from .models import UserProfile
from .serializers import UserProfileSerializer, UsersRegistrationSerializer

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
