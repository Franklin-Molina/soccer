from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import Booking
from users.models import User
from courts.models import Court
from courts.serializers import CourtSerializer
from users.serializers import UserSerializer
from django.utils import timezone

class BookingSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        default=serializers.CurrentUserDefault(),
        write_only=True
    )
    court_details = CourtSerializer(source='court', read_only=True)
    court = serializers.PrimaryKeyRelatedField(
        queryset=Court.objects.all(), write_only=True
    )

    start_time = serializers.DateTimeField()
    end_time = serializers.DateTimeField()
    payment_percentage = serializers.IntegerField(required=False, default=100, min_value=10, max_value=100)

    class Meta:
        model = Booking
        fields = ('id', 'user', 'user_details', 'court', 'court_details', 'start_time', 'end_time', 'status', 'payment', 'payment_percentage', 'created_at')

    def create(self, validated_data):
        # Lógica síncrona directa para evitar problemas ASGI durante el desarrollo
        validated_data.pop('payment_percentage', 100) # El modelo Booking no tiene este campo
        return Booking.objects.create(**validated_data)

    def validate(self, data):
        """
        Valida que la cancha no esté reservada en el rango de tiempo solicitado.
        """
        user = data.get('user') 
        if not user:
            raise ValidationError("El usuario no está autenticado.")

        court = data.get('court')
        start_time = data.get('start_time')
        end_time = data.get('end_time')

        if not court or not start_time or not end_time:
            return data

        instance = self.instance
        if instance:
            overlapping_bookings = Booking.objects.filter(
                court=court,
                start_time__lt=end_time,
                end_time__gt=start_time,
                status__in=['pending', 'confirmed']
            ).exclude(pk=instance.pk)
        else:
            overlapping_bookings = Booking.objects.filter(
                court=court,
                start_time__lt=end_time,
                end_time__gt=start_time,
                status__in=['pending', 'confirmed']
            )

        if overlapping_bookings.exists():
            raise ValidationError("La cancha no está disponible en el rango de tiempo solicitado.")

        if start_time >= end_time:
             raise ValidationError({'end_time': 'La hora de fin debe ser posterior a la hora de inicio.'})

        return data
