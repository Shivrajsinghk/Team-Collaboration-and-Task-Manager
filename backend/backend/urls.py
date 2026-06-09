from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static  

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('teams/', include('teams.urls')),
    path('teams/', include('tasks.urls')),
    path('activity/', include('activity.urls')),
    path('sockets/', include('sockets.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
if settings.DEBUG:
    urlpatterns += [
        path("__debug__/", include("debug_toolbar.urls")),
    ]