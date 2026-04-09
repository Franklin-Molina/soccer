import uuid
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError # Importar ValidationError
from bookings.models import Booking

class Payment(models.Model):
    """
    Modelo para representar un pago asociado a una reserva.
    """
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('completed', 'Completado'),
        ('failed', 'Fallido'),
        ('refunded', 'Reembolsado'),
        ('late_payment', 'Pago Tardío'),
    ]

    METHOD_CHOICES = [
        ('credit_card', 'Tarjeta de Crédito'),
        ('debit_card', 'Tarjeta de Débito'),
        ('pse', 'PSE'),
        ('nequi', 'Nequi'),
        ('daviplata', 'Daviplata'),
        ('reference', 'Pago en Efectivo (Efecty/Baloto)'),
        ('other', 'Otro'),
    ]

    GATEWAY_CHOICES = [
        ('wompi', 'Wompi'),
        ('manual', 'Manual'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    method = models.CharField(max_length=50, choices=METHOD_CHOICES, default='other')
    gateway = models.CharField(max_length=20, choices=GATEWAY_CHOICES, default='wompi')

    # Token de seguridad para consultas públicas (redirección)
    secure_token = models.UUIDField(default=uuid.uuid4, editable=False, 
                                     help_text="Token para verificar el estado sin estar autenticado")
    
    # Campos para Wompi
    reference = models.CharField(max_length=255, blank=True, null=True, unique=True, 
                                  help_text="Referencia única de pago para Wompi")
    transaction_id = models.CharField(max_length=255, blank=True, null=True,
                                       help_text="ID de transacción de Wompi")
    payment_link = models.URLField(max_length=500, blank=True, null=True,
                                    help_text="URL de checkout de Wompi")
    
    # Campo opcional para almacenar datos adicionales de la pasarela de pago
    gateway_data = models.JSONField(null=True, blank=True,
                                     help_text="Datos completos de la respuesta de Wompi")


    def __str__(self):
        return f"Pago de {self.amount} por {self.user.username} ({self.status})"

    def clean(self):
        """
        Valida que el monto del pago sea un valor no negativo.
        """
        if self.amount is not None and self.amount < 0:
            raise ValidationError({'amount': 'El monto del pago no puede ser negativo.'})
