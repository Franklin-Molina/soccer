from django.db import models
from django.core.exceptions import ValidationError # Importar ValidationError

class Plan(models.Model):
    """
    Modelo para representar un plan mensual o recurrente.
    """
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.IntegerField(help_text="Duración del plan en días (ej: 30 para mensual)")
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="Porcentaje de descuento (ej: 10.00 para 10%)")
    auto_renew = models.BooleanField(default=True, help_text="Indica si el plan se renueva automáticamente por defecto")
    benefits = models.TextField(blank=True, help_text="Lista de beneficios incluidos en el plan")

    def __str__(self):
        return self.name

    def clean(self):
        """
        Valida que el precio y la duración sean no negativos y que el porcentaje de descuento esté entre 0 y 100.
        """
        if self.price is not None and self.price < 0:
            raise ValidationError({'price': 'El precio del plan no puede ser negativo.'})
        if self.duration is not None and self.duration <= 0:
            raise ValidationError({'duration': 'La duración del plan debe ser mayor que cero.'})
        if self.discount_percentage is not None and (self.discount_percentage < 0 or self.discount_percentage > 100):
            raise ValidationError({'discount_percentage': 'El porcentaje de descuento debe estar entre 0 y 100.'})
