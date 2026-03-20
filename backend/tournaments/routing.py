from django.urls import path
from . import consumers

websocket_urlpatterns = [
    # Usamos 'path' en lugar de 're_path'. Es más fácil de leer y no falla.
    path('ws/tournaments/<int:tournament_id>/', consumers.TournamentConsumer.as_asgi()),
]

