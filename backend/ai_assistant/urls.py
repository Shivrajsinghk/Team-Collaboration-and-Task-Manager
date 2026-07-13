from django.urls import path
from .views import ai_query, create_subtasks, generate_subtasks

urlpatterns = [
    path('query/', ai_query, name='ai_query'),  
    path('generate-subtasks/', generate_subtasks, name='generate_subtasks'),
    path('create-subtasks/', create_subtasks, name='ai-create-subtasks'),
]
