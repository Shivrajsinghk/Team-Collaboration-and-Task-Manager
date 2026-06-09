import os
from django.core.asgi import get_asgi_application
from channels.routing import URLRouter, ProtocolTypeRouter
from sockets.routing import websocket_urlpatterns
from sockets.middleware import JWTAuthMiddleware 

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': JWTAuthMiddleware(
        URLRouter(
        websocket_urlpatterns
        )
    )
})