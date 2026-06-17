from urllib.parse import parse_qs
from jwt import decode
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

class JWTAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = scope["query_string"].decode()
        params = parse_qs(query_string)
        token = params.get("token")
        if token:
            token = token[0]
            try:
                payload = decode(
                    token,
                    settings.SECRET_KEY,
                    algorithms=["HS256"]
                )
                user = await User.objects.aget(
                    id=payload["user_id"]
                )
                scope["user"] = user
            except Exception:
                raise Exception
        return await self.inner(scope, receive, send)
    