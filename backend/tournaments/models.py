from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Tournament(models.Model):
    STATUS_CHOICES = [
        ('open', 'Inscripciones Abiertas'),
        ('in_progress', 'En Juego'),
        ('finished', 'Finalizado'),
    ]

    name = models.CharField(max_length=200)
    description = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField()
    location = models.CharField(max_length=255, default='Sede Principal')
    prize = models.CharField(max_length=255, blank=True, null=True)
    level = models.CharField(max_length=100, blank=True, null=True)
    format = models.CharField(max_length=100, blank=True, null=True)
    registration_fee = models.DecimalField(max_digits=10, decimal_places=2)
    max_teams = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open') 
    cover_image = models.ImageField(upload_to='tournaments/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    @property
    def registered_teams_count(self):
        return self.teams.count()

class TournamentTeam(models.Model):
    tournament = models.ForeignKey(Tournament, related_name='teams', on_delete=models.CASCADE)
    name = models.CharField(max_length=100) # Ej: "AZTK"
    captain = models.ForeignKey(User, on_delete=models.CASCADE) # Ej: "betta"
    payment_status = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.tournament.name}"

class TournamentMatch(models.Model):
    tournament = models.ForeignKey(Tournament, related_name='matches', on_delete=models.CASCADE)
    team1 = models.ForeignKey(TournamentTeam, related_name='matches_as_team1', on_delete=models.CASCADE, null=True, blank=True)
    team2 = models.ForeignKey(TournamentTeam, related_name='matches_as_team2', on_delete=models.CASCADE, null=True, blank=True)
    
    score1 = models.PositiveIntegerField(default=0)
    score2 = models.PositiveIntegerField(default=0)
    
    date = models.DateTimeField(null=True, blank=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    
    # round_number: 1 (Octavos), 2 (Cuartos), 3 (Semis), 4 (Final) etc.
    round_name = models.CharField(max_length=100, blank=True, null=True) 
    order = models.PositiveIntegerField(default=0) # Para ordenar partidos dentro de una ronda
    
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pendiente'),
        ('in_progress', 'En Juego'),
        ('completed', 'Finalizado'),
        ('cancelled', 'Cancelado'),
    ], default='pending')

    winner = models.ForeignKey(TournamentTeam, related_name='matches_won', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        t1 = self.team1.name if self.team1 else "TBD"
        t2 = self.team2.name if self.team2 else "TBD"
        return f"{t1} vs {t2} - {self.tournament.name}"
