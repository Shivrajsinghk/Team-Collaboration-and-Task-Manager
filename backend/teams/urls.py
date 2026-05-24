from django.urls import path
from .views import (
    create_team,
    delete_team,
    demote_admin_to_member,
    join_team,
    leave_team,
    list_team,
    list_teams,
    member_details,
    members_list,
    promote_member_to_admin,
    remove_user_from_team,
    update_team,
)

urlpatterns = [
    path("", list_teams, name="list_teams"),
    path("create/", create_team, name="create_team"),
    path("join/", join_team, name="join_team"),
    path("<int:team_id>", list_team, name="list_team"),
    path("<int:team_id>/update/", update_team, name="update_team"),
    path("<int:team_id>/delete/", delete_team, name="delete_team"),
    path("<int:team_id>/leave/", leave_team, name="leave_team"),
    path("<int:team_id>/remove-user/<int:user_id>", remove_user_from_team, name="remove_user_from_team"),
    path("<int:team_id>/promote/<int:user_id>", promote_member_to_admin, name="promote_member_to_admin"),
    path("<int:team_id>/demote/<int:user_id>", demote_admin_to_member, name="demote_admin_to_member"),
    path("<int:team_id>/members", members_list, name="members_list"),
    path("<int:team_id>/members/<int:member_id>", member_details, name="member_details"),
]
