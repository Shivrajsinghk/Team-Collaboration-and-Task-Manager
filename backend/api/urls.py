from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # User
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user_profile/', user_profile, name='user_profile'),
    path('user_profile/update/', update_user_profile, name='update_user_profile'),
    path('user_register/', user_register, name='user_register'),

    # Team 
    path('teams/', list_teams, name='list_teams'),
    path('teams/<int:team_id>', list_team, name='list_team'),
    path('teams/create/', create_team, name='create_team'),
    path('teams/<int:team_id>/update/', update_team, name='update_team'),
    path('teams/<int:team_id>/delete/', delete_team, name='delete_team'),
    path('teams/join/', join_team, name='join_team'),
    path('teams/<int:team_id>/leave/', leave_team, name='leave_team'),
    path('teams/<int:team_id>/remove-user/<int:user_id>', remove_user_from_team, name='remove_user_from_team'),
    path('teams/<int:team_id>/promote/<int:user_id>', promote_member_to_admin, name='promote_member_to_admin'),
    path('teams/<int:team_id>/demote/<int:user_id>', demote_admin_to_member, name='demote_admin_to_member'),
    path('teams/<int:team_id>/members/<int:member_id>', member_details, name='member_details'),
    path('teams/<int:team_id>/members', members_list, name='members_list'),

    # Task
    path('teams/<int:team_id>/tasks/', list_tasks, name='list_tasks'),
    path('teams/<int:team_id>/tasks/<int:task_id>/', list_task, name='list_task'),
    path('teams/<int:team_id>/tasks/create/', create_task, name='create_task'),
    path('teams/<int:team_id>/tasks/<int:task_id>/update/', update_task, name='update_task'),
    path('teams/<int:team_id>/tasks/<int:task_id>/update/status/', update_task_status, name='update_task_status'),
    path('teams/<int:team_id>/tasks/<int:task_id>/delete/', delete_task, name='delete_task'),
    path('teams/<int:team_id>/tasks/<int:task_id>/members/<int:member_id>/remove/', remove_member_from_task, name='remove_member_from_task'),
    path('teams/<int:team_id>/tasks/<int:task_id>/members/<int:member_id>/add/', add_member_to_task, name='add_member_to_task'),
] 



# # Teams
# /teams/
# /teams/{id}/

# # Members
# /teams/{id}/members/
# /teams/{id}/members/{member_id}/

# # Tasks
# /teams/{id}/tasks/
# /teams/{id}/tasks/{task_id}/

# # Task Assignment
# /teams/{id}/tasks/{task_id}/members/{member_id}/

# # Role Actions
# /teams/{id}/members/{member_id}/promote/
# /teams/{id}/members/{member_id}/demote/