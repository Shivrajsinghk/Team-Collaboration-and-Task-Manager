from .models import Activity

def create_activity(
    actor, 
    team,
    activity_type, 
    task=None,
    metadata=None
):  
    metadata = metadata or {} 
    snapshot_data = {}

    if actor:
        snapshot_data.update({
            'actor_id': actor.id,
            'actor_username': actor.username
        })

    if team:
        snapshot_data.update({
            'team_id': team.id,
            'team_name': team.name
        })

    if task:
        snapshot_data.update({
            'task_id': task.id,
            'task_title': task.title
        })

    final_metadata = {
        **snapshot_data, 
        **metadata
    }
    
    Activity.objects.create(
        actor=actor,
        team=team,
        activity_type=activity_type, 
        task=task,
        metadata=final_metadata
    )

