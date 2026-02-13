from rest_framework import status, views, viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.decorators import action
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils import timezone
from datetime import timedelta

from .models import Booking
from .serializers import BookingSerializer
from .utils.websocket_notifier import booking_notifier

class BookingStatsView(views.APIView):
    """
    Vista para obtener estadísticas de reservas (órdenes).
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        total_bookings_count = Booking.objects.count()
        thirty_days_ago = timezone.now() - timedelta(days=30)
        new_bookings_count = Booking.objects.filter(created_at__gte=thirty_days_ago).count()
        sixty_days_ago = timezone.now() - timedelta(days=60)
        previous_period_bookings_count = Booking.objects.filter(
            created_at__gte=sixty_days_ago,
            created_at__lt=thirty_days_ago
        ).count()
        
        percentage_change = 0.0
        if previous_period_bookings_count > 0:
            percentage_change = ((new_bookings_count - previous_period_bookings_count) / previous_period_bookings_count) * 100
        elif new_bookings_count > 0:
            percentage_change = 100.0

        stats = {
            'total_bookings': total_bookings_count,
            'percentage_change': round(percentage_change, 2)
        }
        return Response(stats, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class BookingViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']

    def get_permissions(self):
        if self.request.user and self.request.user.is_staff:
            return [IsAdminUser()]
        if self.action in ['list', 'create', 'retrieve', 'update_booking_status']:
            return [IsAuthenticated()]
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        """Crear una reserva síncronamente y notificar por WS"""
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Lógica directa síncrona
            booking = serializer.save(user=request.user)
            response_serializer = self.get_serializer(booking)
            
            # Notificar WebSocket
            booking_notifier.notify_booking_created(response_serializer.data)
            
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Error creating booking: {e}")
            return Response({"error": "Error interno al crear la reserva."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], url_path='update-status')
    def update_booking_status(self, request, pk=None):
        """Actualizar estado de reserva y notificar por WS"""
        new_status = request.data.get('status')
        if not new_status:
            return Response({"error": "El campo 'status' es requerido."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if request.user.is_staff:
                booking = Booking.objects.get(pk=pk)
            else:
                booking = Booking.objects.get(pk=pk, user=request.user)

            booking.status = new_status
            booking.save()
            
            serializer = self.get_serializer(booking)
            
            # Notificar WebSocket
            booking_notifier.notify_booking_updated(serializer.data)
            
            return Response(serializer.data)
        except Booking.DoesNotExist:
            return Response({"detail": "Reserva no encontrada."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def list(self, request, *args, **kwargs):
        user = request.user
        if not user.is_staff:
            bookings = Booking.objects.filter(user=user).order_by('-created_at')
        else:
            bookings = Booking.objects.all().order_by('-created_at')

        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """Remover reserva y notificar por WS"""
        instance = self.get_object()
        booking_id = instance.id
        self.perform_destroy(instance)
        
        # Notificar WebSocket
        booking_notifier.notify_booking_cancelled(booking_id)
        
        return Response(status=status.HTTP_204_NO_CONTENT)
