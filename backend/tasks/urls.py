from django.urls import path
from .views import (
    add_member_to_task,
    create_task,
    delete_task,
    list_task,
    list_tasks,
    remove_member_from_task,
    update_task,
    update_task_status,
)

urlpatterns = [
    path("<int:team_id>/tasks/", list_tasks, name="list_tasks"),
    path("<int:team_id>/tasks/create/", create_task, name="create_task"),
    path("<int:team_id>/tasks/<int:task_id>/", list_task, name="list_task"),
    path("<int:team_id>/tasks/<int:task_id>/update/", update_task, name="update_task"),
    path("<int:team_id>/tasks/<int:task_id>/update/status/", update_task_status, name="update_task_status"),
    path("<int:team_id>/tasks/<int:task_id>/delete/", delete_task, name="delete_task"),
    path("<int:team_id>/tasks/<int:task_id>/members/<int:member_id>/remove/", remove_member_from_task, name="remove_member_from_task"),
    path("<int:team_id>/tasks/<int:task_id>/members/<int:member_id>/add/", add_member_to_task, name="add_member_to_task"),
]
