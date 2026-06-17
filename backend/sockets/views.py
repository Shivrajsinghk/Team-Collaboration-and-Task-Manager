from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Chats, PersonalConversation, PersonalMessage
from .serializer import ChatsSerializer, PersonalConversationSerializer, PersonalMessageSerializer
from teams.models import Team, TeamMembership
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.contrib.auth.models import User

# Team Chat Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
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
@parser_classes([MultiPartParser, FormParser, JSONParser])
def upload_chat_attachments(request, team_id):
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
        attachment=attachment
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




# Personal Chat Views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def get_or_create_personal_conversations_with_new_user(request, other_user_id):
    current_user = request.user
    other_user = get_object_or_404(User, id=other_user_id)
    if current_user == other_user:
        return Response(
            {"error": "You cannot create a conversation with yourself"},
            status=status.HTTP_400_BAD_REQUEST
        )
    existing_conversation = (
        PersonalConversation.objects
        .filter(participant=current_user)
        .filter(participant=other_user)
        .first()
    )
    created=False
    if existing_conversation:
        conversation = existing_conversation
    else:
        conversation = PersonalConversation.objects.create()
        conversation.participant.add(current_user, other_user)
        created = True

    serializer = PersonalConversationSerializer(conversation, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK if created==False else status.HTTP_201_CREATED)

# To see the Last message (Useful for the left sidebar). It uses PersonalConversationSerializer
# Best use is for Chat Dropdown (Frontend) and Left sideBar Message Dashboard
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_conversations(request):
    conversations = (
        PersonalConversation.objects
        .filter(participant=request.user)
        .prefetch_related('participant')
        .order_by('-created_at')
    )
    serializer = PersonalConversationSerializer(
        conversations,
        many=True,
        context={'request': request}
    )
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_personal_message(request, conversation_id):
    conversation = get_object_or_404(
        PersonalConversation,
        id=conversation_id,
        participant=request.user
    )
    message = request.data.get('message', '').strip()
    if not message:
        return Response(
            {'error': 'Message cannot be empty'},
            status=status.HTTP_400_BAD_REQUEST
        )
    chat = PersonalMessage.objects.create(
        personal_conversation=conversation,
        sender=request.user,
        message=message
    )
    serializer = PersonalMessageSerializer(
        chat,
        context={'request': request}
    )
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_personal_messages(request, conversation_id):
    conversation = get_object_or_404(PersonalConversation, id=conversation_id)
    if not conversation.participant.filter(
        id=request.user.id
    ).exists():
        return Response(
            {"message": "You are not a participant in this conversation."},
            status=status.HTTP_403_FORBIDDEN
        )
    messages = PersonalMessage.objects.filter(
        personal_conversation=conversation,
    ).order_by('created_at')
    serializer = PersonalMessageSerializer(messages, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def upload_personal_attachments(request, conversation_id):
    personal_conversation = get_object_or_404(
        PersonalConversation, 
        id=conversation_id, 
        participant=request.user
    )
    attachment = request.FILES.get('file')
    message = (request.data.get('message') or '').strip()
    if not attachment:
        return Response(
            {"message": "Please choose a file to upload."},
            status=status.HTTP_400_BAD_REQUEST
        )
    if not attachment and not message:
        return Response(
            {"message": "Message or attachment is required."},
            status=status.HTTP_400_BAD_REQUEST
        )
    MAX_SIZE = 10 * 1024 * 1024  
    if attachment.size > MAX_SIZE:
        return Response(
            {"message": "File size cannot exceed 10 MB."},
            status=status.HTTP_400_BAD_REQUEST
        )
    msg = PersonalMessage.objects.create(
        personal_conversation=personal_conversation,
        sender=request.user,
        message=message,
        attachment=attachment
    )
    serializer = PersonalMessageSerializer(msg, context={'request': request})
    payload = serializer.data
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'conversation_{conversation_id}',
        {
            'type': 'chat_message',
            'chat': payload
        }
    )
    return Response(payload, status=status.HTTP_201_CREATED)
