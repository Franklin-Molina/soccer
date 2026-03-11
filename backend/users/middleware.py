from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import get_user_model

User = get_user_model()

@database_sync_to_async
def get_user(token_key):
    """
    Obtiene el usuario a partir de un token JWT.

    Args:
        token_key (str): El token JWT.

    Returns:
        User: El usuario autenticado o AnonymousUser si el token es inválido.
    """
    try:
        access_token = AccessToken(token_key)
        user_id = access_token['user_id']
        return User.objects.get(id=user_id)
    except (InvalidToken, TokenError, User.DoesNotExist):
        return AnonymousUser()

from django.conf import settings
from django.http import parse_cookie

class JWTAuthMiddleware:
    """
    Middleware para autenticar vía Cookie HttpOnly en WebSockets.
    """
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        # Intentar obtener el token de la cookie
        headers = dict(scope.get('headers', []))
        cookie_header = headers.get(b'cookie', b'').decode()
        cookies = parse_cookie(cookie_header)
        
        auth_cookie_name = settings.SIMPLE_JWT.get('AUTH_COOKIE', 'access_token')
        token = cookies.get(auth_cookie_name)

        if token:
            scope['user'] = await get_user(token)
        else:
            # Fallback a subprotocolo por si acaso (compatibilidad)
            subprotocols = scope.get('subprotocols', [])
            if subprotocols:
                token = subprotocols[0]
                scope['user'] = await get_user(token)
                scope['accepted_subprotocol'] = token
            else:
                scope['user'] = AnonymousUser()

        return await self.app(scope, receive, send)

from django.shortcuts import redirect

class RedirectUnauthorizedMiddleware:
    """
    Middleware para redirigir respuestas de no autorizado (401, 403) al home (/).
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Si la respuesta es 401 (Unauthorized) o 403 (Forbidden)
        if response.status_code in [401, 403]:
            # NO redirigir si es una petición a la API
            if request.path.startswith('/api/'):
                return response
                
            # Evitar redirección infinita si ya estamos en /
            if request.path != '/':
                return redirect('/')
                
        return response
