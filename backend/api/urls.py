from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import get_search_results, update_user_profile, user_profile, user_register, get_public_profile

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user_profile/', user_profile, name='user_profile'),
    path('profile/<str:username>/', get_public_profile, name='get_public_profile'),
    path('user_profile/update/', update_user_profile, name='update_user_profile'),
    path('user_register/', user_register, name='user_register'),
    path('search/', get_search_results, name='get_search_results'),
]
