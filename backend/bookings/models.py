from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError # Importar ValidationError
from courts.models import Court
# Importar el modelo Payment una vez que esté definido en la aplicación payments
# from payments.models import Payment

class Booking(models.Model):
    """
    Modelo para representar una reserva de cancha.
    """
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('confirmed', 'Confirmada'),
        ('cancelled', 'Cancelada'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    court = models.ForeignKey(Court, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    # Relación con el modelo Payment. Nullable porque el pago puede no existir inicialmente.
    payment = models.ForeignKey('payments.Payment', on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reserva de {self.court.name} por {self.user.username} ({self.start_time.strftime('%Y-%m-%d %H:%M')})"

    def clean(self):
        """
        Valida que la hora de inicio sea anterior a la hora de fin.
        """
        if self.start_time and self.end_time and self.start_time >= self.end_time:
            raise ValidationError({'end_time': 'La hora de fin debe ser posterior a la hora de inicio.'})
