"""
ASGI config for cancha project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from users.middleware import JWTAuthMiddleware

# Configurar Django ANTES de importar las rutas
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cancha.settings')

# Obtener la aplicación ASGI de Django para HTTP
django_asgi_app = get_asgi_application()

# Ahora SÍ importar las rutas (después de configurar Django)
from matches.routing import websocket_urlpatterns as matches_ws
from bookings.routing import websocket_urlpatterns as bookings_ws
from users.routing import websocket_urlpatterns as users_ws
from chat.routing import websocket_urlpatterns as chat_ws

combined_ws_urlpatterns = matches_ws + bookings_ws + users_ws + chat_ws

application = ProtocolTypeRouter({
    # HTTP normal usa Django ASGI
    "http": django_asgi_app,
    
    # Solo WebSocket usa el routing especial
    "websocket": JWTAuthMiddleware(
        AuthMiddlewareStack(
            URLRouter(
                combined_ws_urlpatterns
            )
        )
    ),
})
