from django.utils import timezone
from tasks.models import Task  
from teams.models import TeamMembership  
from django.db.models import Q, F, Case, When, IntegerField

PRIORITY_WEIGHT = {"low": 1, "medium": 2, "high": 3}

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

# Priority score (1-100): urgency (due date, weighted 75%) + user-set priority (weighted 25%) + small in-progress bonus.
# Overdue tasks always score highest (100, minus nothing); score reflects how close/overdue a task is, not just its label.
def _compute_priority_score(task, now):
    days_until_due = (task.due_date - now).total_seconds() / 86400

    if days_until_due < 0:
        urgency_pct = 100
    elif days_until_due <= 1:
        urgency_pct = 85
    elif days_until_due <= 2:
        urgency_pct = 65
    elif days_until_due <= 7:
        urgency_pct = 30
    else:
        urgency_pct = 5

    priority_pct = {"low": 20, "medium": 60, "high": 100}.get(task.priority, 0)
    status_bonus = 5 if task.status == "in_progress" else 0

    score = (0.75 * urgency_pct) + (0.25 * priority_pct) + status_bonus
    return max(1, min(100, round(score)))

def get_task_priorities(team_id, requesting_user):
    is_member = TeamMembership.objects.filter(
        user=requesting_user,
        team_id=team_id
    ).exists()

    if not is_member:
        return {"error": "You don't have access to this team."}

    now = timezone.now()

    tasks = Task.objects.filter(
        team_id=team_id
    ).exclude(
        status='done'
    ).prefetch_related('assigned_to')

    scored = [
        {
            "title": t.title,
            "assigned_to": [u.username for u in t.assigned_to.all()] or ["Unassigned"],
            "due_date": t.due_date.isoformat(),
            "priority": t.priority,
            "status": t.status,
            "score": _compute_priority_score(t, now),
        }
        for t in tasks
    ]

    scored.sort(key=lambda x: x["score"], reverse=True)

    return {
        "count": len(scored),
        "tasks": scored,
    }

def get_team_workload(team_id, requesting_user):
    is_member = TeamMembership.objects.filter(
        user=requesting_user,
        team_id=team_id
    ).exists()

    if not is_member:
        return {"error": "You don't have access to this team."}

    tasks = Task.objects.filter(
        team_id=team_id,
        parent_task__isnull=True,   # exclude subtasks from workload counts
    ).exclude(
        status='done'
    ).prefetch_related('assigned_to')

    workload = {}
    unassigned_count = 0

    for task in tasks:
        assignees = list(task.assigned_to.all())
        if not assignees:
            unassigned_count += 1
            continue
        for user in assignees:
            entry = workload.setdefault(user.username, {"todo": 0, "in_progress": 0, "total": 0})
            entry[task.status] = entry.get(task.status, 0) + 1
            entry["total"] += 1

    # simple overload flag: more than 5 active (non-done) tasks assigned
    result = []
    for username, counts in workload.items():
        result.append({
            "member": username,
            "todo": counts.get("todo", 0),
            "in_progress": counts.get("in_progress", 0),
            "total_active": counts["total"],
            "overloaded": counts["total"] > 5,
        })

    result.sort(key=lambda x: x["total_active"], reverse=True)

    return {
        "workload_by_member": result,
        "unassigned_tasks": unassigned_count,
    }

def search_tasks(requesting_user, query="", status=None, priority=None, team_id=None):
    if team_id is not None:
        is_member = TeamMembership.objects.filter(
            user=requesting_user,
            team_id=team_id
        ).exists()
        if not is_member:
            return {"error": "You don't have access to this team."}

    tasks_data = Task.objects.filter(
        team__memberships__user=requesting_user
    ).distinct()

    if query.strip():
        tasks_data = tasks_data.filter(
            Q(title__icontains=query) |
            Q(description__icontains=query) |
            Q(team__name__icontains=query)
        )

    if status in dict(Task.STATUS_CHOICE):
        tasks_data = tasks_data.filter(status=status)

    if priority in dict(Task.PRIORITY_CHOICE):
        tasks_data = tasks_data.filter(priority=priority)

    if team_id:
        tasks_data = tasks_data.filter(team_id=team_id)

    tasks_data = tasks_data.order_by('-created_at').prefetch_related('assigned_to')[:15]

    return {
        "count": tasks_data.count(),
        "tasks": [
            {
                "title": t.title,
                "status": t.status,
                "priority": t.priority,
                "due_date": t.due_date.isoformat() if t.due_date else None,
                "assigned_to": [u.username for u in t.assigned_to.all()] or ["Unassigned"],
                "team": t.team.name,
            }
            for t in tasks_data
        ]
    }
