from django.utils import timezone
from tasks.models import Task  
from teams.models import TeamMembership  

def get_overdue_tasks(team_id, requesting_user):
    is_member = TeamMembership.objects.filter(
        user=requesting_user, 
        team_id=team_id
    ).exists()

    if not is_member:
        return {"error": "You don't have access to this team."}

    overdue = Task.objects.filter(
        team_id=team_id,
        due_date__lt=timezone.now(),
    ).exclude(
        status='done'
    ).prefetch_related('assigned_to')

    return {
        "count": overdue.count(),
        "tasks": [
            {
                "title": t.title,
                "assigned_to": [u.username for u in t.assigned_to.all()] or ["Unassigned"],
                "due_date": t.due_date.isoformat(),
                "priority": t.priority,
            }
            for t in overdue
        ]
    }
