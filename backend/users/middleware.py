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

class JWTAuthMiddleware:
    """
    Middleware para autenticar vía Subprotocolo (Sec-WebSocket-Protocol).
    Esta técnica permite enviar el token sin exponerlo en los parámetros GET.
    """
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        # Buscamos el token en los subprotocolos
        subprotocols = scope.get('subprotocols', [])
        
        # Asumimos que si hay un subprotocolo, es el token
        if subprotocols:
            token = subprotocols[0] 
            scope['user'] = await get_user(token)
            
            # ¡IMPORTANTE! 
            # Debemos aceptar el subprotocolo para que el navegador no cierre la conexión
            # por "protocol mismatch". Se pasa al scope para que el consumer lo maneje.
            scope['accepted_subprotocol'] = token 
        else:
            scope['user'] = AnonymousUser()

        return await self.app(scope, receive, send)
