from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Notification

def create_notification(
    user,
    notification_type,
    title,
    message,
    extra_data=None
):

    notification = Notification.objects.create(
        user=user,
        notification_type=notification_type,
        title=title,
        message=message,
        extra_data=extra_data or {}
    )
    channel_layer = get_channel_layer()
    group_name = f'notifications_{user.id}'
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "send_notification",
            "notification": {
                "id": notification.id,
                "title": title,
                "message": message,
                "notification_type": notification_type,
                "created_at": notification.created_at.isoformat(),
                "extra_data": notification.extra_data
            }
        }
    )

    return notification