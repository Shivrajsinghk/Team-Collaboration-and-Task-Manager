from django.contrib.auth import get_user_model
from django.db import transaction
from teams.models import TeamMembership
from .models import Mention
from .utils import create_notification

User = get_user_model()

@transaction.atomic
def process_mentions(message, mentioned_user_ids):
    if not mentioned_user_ids:
        return []

    candidate_ids = set(mentioned_user_ids) - {message.sender_id}
    if not candidate_ids:
        return []

    valid_user_ids = set(
        TeamMembership.objects
        .filter(
            team=message.team, 
            user_id__in=candidate_ids
        )
        .values_list('user_id', flat=True)
    )
    if not valid_user_ids:
        return []

    users = User.objects.filter(id__in=valid_user_ids)
    for user in users:
        _, created = Mention.objects.get_or_create(
            message=message, 
            user=user
        )
        if not created:
            continue  

        create_notification(
            user=user,
            notification_type="mention",
            title="New Mention",
            message=f"{message.sender.username.title()} mentioned you in the team {message.team.name.title()}",
            extra_data={
                "team_id": message.team.id,
                "message_id": message.id,
                "actor_id": message.sender_id,
            }
        )