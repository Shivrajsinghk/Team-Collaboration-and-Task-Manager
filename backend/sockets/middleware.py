from urllib.parse import parse_qs
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

User = get_user_model()

class JWTAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = scope["query_string"].decode()
        params = parse_qs(query_string)
        token = params.get("token")
        scope["user"] = AnonymousUser()
        if token:
            try:
                raw_token = token[0]
                validated = AccessToken(raw_token)
                user = await User.objects.aget(id=validated["user_id"])
                scope["user"] = user
            except (TokenError, InvalidToken):
                pass 
            except User.DoesNotExist:
                pass  
            except Exception as e:
                print(f"Unexpected middleware error: {e}")

            return await self.inner(scope, receive, send)
    