# matches/views.py - VERSIÓN CORREGIDA (SIN asyncio.run)

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from .models import OpenMatch, MatchCategory
from .serializers import OpenMatchSerializer, MatchCategorySerializer
from .utils.websocket_notifier import match_notifier
from .permissions import IsMatchCreator

class OpenMatchViewSet(viewsets.ModelViewSet):
    queryset = OpenMatch.objects.all()
    serializer_class = OpenMatchSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        """Crear un nuevo partido"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Crear el partido directamente (sin use case async)
        match = serializer.save(creator=request.user)
        
        # Agregar el creador como participante
        from .models import MatchParticipant
        MatchParticipant.objects.create(match=match, user=request.user)
        
        # Recargar para obtener participantes
        match.refresh_from_db()
        response_serializer = self.get_serializer(match)
        
        # Notificar por WebSocket
        match_notifier.notify_match_created(response_serializer.data)
        
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """Actualizar un partido existente"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        self.check_object_permissions(request, instance)

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        # Actualizar directamente
        match = serializer.save()
        
        response_serializer = self.get_serializer(match)
        
        # Notificar por WebSocket
        match_notifier.notify_match_updated(response_serializer.data)
        
        return Response(response_serializer.data)

    def list(self, request, *args, **kwargs):
        """Listar todos los partidos abiertos y futuros"""
        from django.utils import timezone
        
        # 1. OPTIMIZACIÓN N+1: select_related para claves foráneas directas y prefetch_related para las relaciones muchos a muchos o inversas.
        # Asumo que tus relaciones se llaman 'creator', 'category', 'court' y 'participants' en tu modelo OpenMatch.
        queryset = self.get_queryset().select_related('creator', 'category', 'court').prefetch_related('participants__user').filter(
            status='OPEN',
            start_time__gte=timezone.now()
        ).order_by('start_time')
        
        # 2. Respetar la paginación (Opcional pero muy recomendado si tienes muchos partidos)
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
        
        # Validaciones
        if match.status != 'OPEN':
            return Response(
                {'detail': 'Este partido ya no está abierto.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar si ya está participando
        from .models import MatchParticipant
        if MatchParticipant.objects.filter(match=match, user=user).exists():
            return Response(
                {'detail': 'Ya estás participando en este partido.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar cupo
        current_participants = MatchParticipant.objects.filter(match=match).count()
        if current_participants >= match.players_needed + 1:
            return Response(
                {'detail': 'El partido está completo.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Agregar participante
        MatchParticipant.objects.create(match=match, user=user)
        
        # Recargar y serializar
        match.refresh_from_db()
        match_serializer = self.get_serializer(match)
        
        # Notificar por WebSocket
        match_notifier.notify_participant_joined(
            match_id=match.id,
            user_data={
                'id': user.id,
                'username': user.username
            },
            participants_data=match_serializer.data['participants']
        )
        
        return Response(match_serializer.data)

    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        """Salir de un partido"""
        match = self.get_object()
        user = request.user
        
        # Verificar que no sea el creador
        if match.creator == user:
            return Response(
                {'detail': 'El creador no puede abandonar el partido. Debe cancelarlo.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Remover participante
        from .models import MatchParticipant
        deleted_count, _ = MatchParticipant.objects.filter(match=match, user=user).delete()
        
        if deleted_count == 0:
            return Response(
                {'detail': 'No estás participando en este partido.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Recargar y serializar
        match.refresh_from_db()
        match_serializer = self.get_serializer(match)
        
        # Notificar por WebSocket
        match_notifier.notify_participant_left(
            match_id=match.id,
            user_data={
                'id': user.id,
                'username': user.username
            },
            participants_data=match_serializer.data['participants']
        )
        
        return Response(match_serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsMatchCreator])
    def cancel(self, request, pk=None):
        """Cancelar un partido (solo creador)"""
        match = self.get_object()
        
        # Cambiar estado a cancelado
        match.status = 'CANCELLED'
        match.save()
        
        match_serializer = self.get_serializer(match)
        
        # Notificar por WebSocket
        match_notifier.notify_match_cancelled(
            match_id=match.id,
            match_data=match_serializer.data
        )
        
        return Response(match_serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsMatchCreator])
    def remove_participant(self, request, pk=None):
        """Expulsar a un participante (solo creador)"""
        match = self.get_object()
        user_id_to_remove = request.data.get('user_id')
        
        if not user_id_to_remove:
            return Response(
                {'detail': 'user_id es requerido.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar que no intente expulsarse a sí mismo
        if str(user_id_to_remove) == str(request.user.id):
            return Response(
                {'detail': 'No puedes expulsarte a ti mismo.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener info del usuario antes de removerlo
        from django.contrib.auth import get_user_model
        from .models import MatchParticipant
        
        User = get_user_model()
        try:
            user_to_remove = User.objects.get(id=user_id_to_remove)
            user_data = {
                'id': user_to_remove.id,
                'username': user_to_remove.username
            }
        except User.DoesNotExist:
            return Response(
                {'detail': 'Usuario no encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Remover participante
        deleted_count, _ = MatchParticipant.objects.filter(
            match=match, 
            user_id=user_id_to_remove
        ).delete()
        
        if deleted_count == 0:
            return Response(
                {'detail': 'El usuario no está participando en este partido.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Recargar y serializar
        match.refresh_from_db()
        match_serializer = self.get_serializer(match)
        
        # Notificar por WebSocket
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
        from django.utils import timezone
        from .models import MatchParticipant
        
        # Obtener IDs de partidos donde el usuario participa
        participant_matches = MatchParticipant.objects.filter(
            user=request.user
        ).values_list('match_id', flat=True)
        
        # Aplicamos la misma optimización N+1 aquí
        matches = self.get_queryset().select_related('creator', 'category', 'court').prefetch_related('participants__user').filter(
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
