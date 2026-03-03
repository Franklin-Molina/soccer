from django.db import models
from django.core.exceptions import ValidationError # Importar ValidationError
import os # Importar el módulo os para manejar operaciones de archivos

class Court(models.Model):
    """
    Modelo para representar una cancha sintética.
    """
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True, help_text="Indica si la cancha está activa o suspendida.")
    # La disponibilidad se gestionará a través del modelo de Reservas

    def __str__(self):
        return self.name

    def clean(self):
        """
        Valida que el precio de la cancha sea un valor no negativo.
        """
        if self.price is not None and self.price < 0:
            raise ValidationError({'price': 'El precio no puede ser negativo.'})

from utils.supabase_storage import supabase_storage

class CourtImage(models.Model):
    """
    Modelo para representar una imagen asociada a una cancha (Almacenada en Supabase).
    """
    court = models.ForeignKey(Court, related_name='images', on_delete=models.CASCADE)
    image_url = models.URLField(max_length=1000, default='')

    def __str__(self):
        return f"Image for {self.court.name}"

    def delete(self, *args, **kwargs):
        """
        Al eliminar el registro, también eliminamos la imagen de Supabase.
        """
        if self.image_url:
            supabase_storage.delete_image(self.image_url)
        super().delete(*args, **kwargs)
