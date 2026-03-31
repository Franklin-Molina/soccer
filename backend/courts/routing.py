from django.urls import path
from . import consumers

websocket_urlpatterns = [
    # Endpoint para la lista general de canchas
    path('ws/courts/', consumers.CourtListConsumer.as_asgi()),
    # Endpoint para una cancha específica
    path('ws/courts/<int:court_id>/', consumers.CourtConsumer.as_asgi()),
]
