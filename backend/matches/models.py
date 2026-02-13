from django.db import models
from django.conf import settings
from courts.models import Court

class MatchCategory(models.Model):
    """
    Representa una categoría para un partido (ej. Mixto, Hombres, Mujeres).
    """
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class OpenMatch(models.Model):
    """
    Representa un partido abierto creado por un usuario para buscar jugadores.
    """
    class MatchStatus(models.TextChoices):
        OPEN = 'OPEN', 'Abierto'
        FULL = 'FULL', 'Completo'
        CANCELLED = 'CANCELLED', 'Cancelado'
        COMPLETED = 'COMPLETED', 'Completado'

    court = models.ForeignKey(Court, on_delete=models.CASCADE, related_name='open_matches')
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_matches')
    category = models.ForeignKey(MatchCategory, on_delete=models.PROTECT, related_name='matches')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    players_needed = models.PositiveIntegerField()
    status = models.CharField(
        max_length=10,
        choices=MatchStatus.choices,
        default=MatchStatus.OPEN
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Partido en {self.court.name} a las {self.start_time.strftime('%Y-%m-%d %H:%M')}"

class MatchParticipant(models.Model):
    """
    Representa a un usuario que se ha unido a un partido abierto.
    """
    match = models.ForeignKey(OpenMatch, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='joined_matches')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('match', 'user')

    def __str__(self):
        return f"{self.user.username} se unió a {self.match}"
