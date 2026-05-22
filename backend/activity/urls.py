from django.urls import path
from .views import *

urlpatterns = [
    path('teams/<int:team_id>/activities/', list_team_activities, name="list_team_activities"),
    path('teams/<int:team_id>/tasks/<int:task_id>/activities/', list_task_activities, name="list_task_activities"),
]