from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializer import ChatsSerializer
from teams.models import Team, TeamMembership
from .models import Chats
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def list_chats(request, team_id):
    team = get_object_or_404(Team, id=team_id)
    membership = TeamMembership.objects.filter(
        team=team,
        user=request.user
    ).exists()
    if not membership:
        return Response(
        {"message": "You are not a member of this team."},
        status=status.HTTP_403_FORBIDDEN
    )
    chats = Chats.objects.filter(
        team=team
    ).select_related('sender')
    serializer = ChatsSerializer(chats, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_chat_attachment(request, team_id):
    team = get_object_or_404(Team, id=team_id)
    membership = TeamMembership.objects.filter(
        team=team,
        user=request.user
    ).exists()
    if not membership:
        return Response(
            {"message": "You are not a member of this team."},
            status=status.HTTP_403_FORBIDDEN
        )
    attachment = request.FILES.get('file')
    message = (request.data.get('message') or '').strip()
    if not attachment:
        return Response(
            {"message": "Please choose a file to upload."},
            status=status.HTTP_400_BAD_REQUEST
        )
    chat = Chats.objects.create(
        team=team,
        sender=request.user,
        message=message,
        attachments=attachment
    )
    serializer = ChatsSerializer(chat, context={'request': request})
    payload = serializer.data
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'team_{team_id}',
        {
            'type': 'chat_message',
            'chat': payload
        }
    )
    return Response(payload, status=status.HTTP_201_CREATED)
