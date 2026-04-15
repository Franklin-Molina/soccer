# matches/views.py - VERSIÓN CORREGIDA (CON TRANSACCIONES ATÓMICAS)

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.db import transaction
from django.utils import timezone
import uuid
import logging

from .models import OpenMatch, MatchCategory, MatchParticipant
from .serializers import OpenMatchSerializer, MatchCategorySerializer
from .utils.websocket_notifier import match_notifier
from .permissions import IsMatchCreator
from bookings.models import Booking
from bookings.serializers import BookingSerializer
from bookings.utils.websocket_notifier import booking_notifier
from payments.models import Payment
from payments.services.wompi_service import wompi_service

logger = logging.getLogger(__name__)

class OpenMatchViewSet(viewsets.ModelViewSet):
    queryset = OpenMatch.objects.all()
    serializer_class = OpenMatchSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        """Crear un nuevo partido (estándar, sin pago forzado)"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        match = serializer.save(creator=request.user)
        MatchParticipant.objects.create(match=match, user=request.user)
        
        match.refresh_from_db()
        response_serializer = self.get_serializer(match)
        match_notifier.notify_match_created(response_serializer.data)
        
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='create-with-payment')
    def create_with_payment(self, request):
        """
        Crea un partido y una reserva de forma atómica, iniciando el flujo de pago.
        """
        data = request.data
        court_id = data.get('court_id')
        category_id = data.get('category_id')
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        players_needed = data.get('players_needed', 1)
        payment_percentage = data.get('payment_percentage', 100)

        if not all([court_id, category_id, start_time, end_time]):
            return Response({"error": "Faltan campos obligatorios."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                # 1. Crear la Reserva (Booking) en estado 'pending'
                from courts.models import Court
                court = Court.objects.get(id=court_id)
                
                booking = Booking.objects.create(
                    user=request.user,
                    court=court,
                    start_time=start_time,
                    end_time=end_time,
                    status='pending'
                )

                # 2. Crear el Partido (OpenMatch) en estado 'PENDING_PAYMENT'
                category = MatchCategory.objects.get(id=category_id)
                match = OpenMatch.objects.create(
                    creator=request.user,
                    court=court,
                    category=category,
                    start_time=start_time,
                    end_time=end_time,
                    players_needed=players_needed,
                    status='PENDING_PAYMENT',
                    booking=booking
                )

                # 3. Agregar al creador como participante
                MatchParticipant.objects.create(match=match, user=request.user)

                # 4. Iniciar el proceso de Pago (Payment)
                reference = f"match-{match.id}-{uuid.uuid4().hex[:8]}"
                
                # Calcular monto (soporte para porcentaje)
                # Duración en horas
                from datetime import datetime
                if isinstance(start_time, str):
                    st = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
                    et = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
                else:
                    st = start_time
                    et = end_time
                
                duration_hours = (et - st).total_seconds() / 3600
                total_amount = court.price * int(duration_hours)
                amount_to_pay = (total_amount * payment_percentage) / 100

                payment = Payment.objects.create(
                    user=request.user,
                    booking=booking,
                    amount=amount_to_pay,
                    status='pending',
                    gateway='wompi',
                    reference=reference
                )

                # 5. Obtener URL de Wompi
                amount_cents = int(payment.amount * 100)
                result = wompi_service.create_checkout(
                    reference=reference,
                    amount_in_cents=amount_cents,
                    customer_email=request.user.email,
                    customer_name=f"{request.user.first_name} {request.user.last_name}".strip(),
                    secure_token=str(payment.secure_token)
                )

                if not result.get("success"):
                    raise Exception(result.get("error", "Error al crear checkout en Wompi"))

                payment.payment_link = result.get("payment_url")
                payment.gateway_data = result.get("raw_response")
                payment.save()

                # 6. Notificar creación de reserva vía WebSocket (después de commit)
                serializer = BookingSerializer(booking)
                transaction.on_commit(lambda: booking_notifier.notify_booking_created(serializer.data))

                return Response({
                    "match_id": match.id,
                    "booking_id": booking.id,
                    "payment_url": payment.payment_link,
                    "status": match.status
                }, status=status.HTTP_201_CREATED)

        except Court.DoesNotExist:
            return Response({"error": "La cancha seleccionada no existe."}, status=status.HTTP_404_NOT_FOUND)
        except MatchCategory.DoesNotExist:
            return Response({"error": "La categoría seleccionada no existe."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error en create_with_payment: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, *args, **kwargs):
        """Actualizar un partido existente"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        self.check_object_permissions(request, instance)

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        match = serializer.save()
        response_serializer = self.get_serializer(match)
        match_notifier.notify_match_updated(response_serializer.data)
        
        return Response(response_serializer.data)

    def list(self, request, *args, **kwargs):
        """Listar todos los partidos abiertos y futuros"""
        from django.utils import timezone
        
        queryset = self.get_queryset().select_related('creator', 'category', 'court', 'booking').prefetch_related('participants__user').filter(
            status='OPEN',
            start_time__gte=timezone.now()
        ).order_by('start_time')
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        """Obtener detalles de un partido"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """Unirse a un partido"""
        match = self.get_object()
        user = request.user
        
        if match.status != 'OPEN':
            return Response({'detail': 'Este partido ya no está abierto.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if MatchParticipant.objects.filter(match=match, user=user).exists():
            return Response({'detail': 'Ya estás participando en este partido.'}, status=status.HTTP_400_BAD_REQUEST)
        
        current_participants = MatchParticipant.objects.filter(match=match).count()
        if current_participants >= match.players_needed + 1:
            return Response({'detail': 'El partido está completo.'}, status=status.HTTP_400_BAD_REQUEST)
        
        MatchParticipant.objects.create(match=match, user=user)
        
        match.refresh_from_db()
        match_serializer = self.get_serializer(match)
        
        match_notifier.notify_participant_joined(
            match_id=match.id,
            user_data={'id': user.id, 'username': user.username},
            participants_data=match_serializer.data['participants']
        )
        
        return Response(match_serializer.data)

    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        """Salir de un partido"""
        match = self.get_object()
        user = request.user
        
        if match.creator == user:
            return Response({'detail': 'El creador no puede abandonar el partido. Debe cancelarlo.'}, status=status.HTTP_400_BAD_REQUEST)
        
        deleted_count, _ = MatchParticipant.objects.filter(match=match, user=user).delete()
        
        if deleted_count == 0:
            return Response({'detail': 'No estás participando en este partido.'}, status=status.HTTP_400_BAD_REQUEST)
        
        match.refresh_from_db()
        match_serializer = self.get_serializer(match)
        
        match_notifier.notify_participant_left(
            match_id=match.id,
            user_data={'id': user.id, 'username': user.username},
            participants_data=match_serializer.data['participants']
        )
        
        return Response(match_serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsMatchCreator])
    def cancel(self, request, pk=None):
        """Cancelar un partido (solo creador)"""
        match = self.get_object()
        match.status = 'CANCELLED'
        match.save()
        
        # Si tiene reserva, cancelarla también
        if match.booking:
            match.booking.status = 'cancelled'
            match.booking.save()
        
        match_serializer = self.get_serializer(match)
        match_notifier.notify_match_cancelled(match_id=match.id, match_data=match_serializer.data)
        
        return Response(match_serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsMatchCreator])
    def remove_participant(self, request, pk=None):
        """Expulsar a un participante (solo creador)"""
        match = self.get_object()
        user_id_to_remove = request.data.get('user_id')
        
        if not user_id_to_remove:
            return Response({'detail': 'user_id es requerido.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if str(user_id_to_remove) == str(request.user.id):
            return Response({'detail': 'No puedes expulsarte a ti mismo.'}, status=status.HTTP_400_BAD_REQUEST)
        
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            user_to_remove = User.objects.get(id=user_id_to_remove)
            user_data = {'id': user_to_remove.id, 'username': user_to_remove.username}
        except User.DoesNotExist:
            return Response({'detail': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        
        deleted_count, _ = MatchParticipant.objects.filter(match=match, user_id=user_id_to_remove).delete()
        
        if deleted_count == 0:
            return Response({'detail': 'El usuario no está participando en este partido.'}, status=status.HTTP_400_BAD_REQUEST)
        
        match.refresh_from_db()
        match_serializer = self.get_serializer(match)
        
        match_notifier.notify_participant_removed(
            match_id=match.id,
            user_data=user_data,
            participants_data=match_serializer.data['participants']
        )
        
        return Response(match_serializer.data)

    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Obtener todas las categorías"""
        categories = MatchCategory.objects.all()
        serializer = MatchCategorySerializer(categories, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='my-upcoming-matches')
    def my_upcoming_matches(self, request):
        """Obtener próximos partidos del usuario actual"""
        from .models import MatchParticipant
        
        participant_matches = MatchParticipant.objects.filter(user=request.user).values_list('match_id', flat=True)
        
        matches = self.get_queryset().select_related('creator', 'category', 'court', 'booking').prefetch_related('participants__user').filter(
            id__in=participant_matches,
            status='OPEN',
            start_time__gte=timezone.now()
        ).order_by('start_time')
        
        serializer = self.get_serializer(matches, many=True)
        return Response(serializer.data)

    def get_permissions(self):
        """Definir permisos según la acción"""
        if self.action in ['update', 'partial_update', 'destroy', 'cancel', 'remove_participant']:
            self.permission_classes = [IsAuthenticated, IsMatchCreator]
        else:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()
