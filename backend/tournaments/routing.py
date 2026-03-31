from django.urls import path
from . import consumers

websocket_urlpatterns = [
    # Endpoint para la lista general de torneos
    path('ws/tournaments/', consumers.TournamentListConsumer.as_asgi()),
    # Endpoint para un torneo específico (partidos)
    path('ws/tournaments/<int:tournament_id>/', consumers.TournamentConsumer.as_asgi()),
]

