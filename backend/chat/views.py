from rest_framework import viewsets, permissions
from .models import ChatMessage
from .serializers import ChatMessageSerializer
from matches.models import OpenMatch, MatchParticipant
from django.utils import timezone

class ChatMessageViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Vista para leer el historial de mensajes de un partido.
    Solo accesible para participantes y antes de que el partido comience.
    """
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        match_id = self.request.query_params.get('match_id')
        if not match_id:
            return ChatMessage.objects.none()

        try:
            match = OpenMatch.objects.get(id=match_id)
            
            # Verificar si el usuario es participante o creador
            is_participant = MatchParticipant.objects.filter(match=match, user=self.request.user).exists()
            is_creator = match.creator == self.request.user
            
            if not (is_participant or is_creator):
                return ChatMessage.objects.none()

            # Lógica de "cerrado": 
            # Si el partido ya comenzó, el frontend lo ve como cerrado, pero el backend
            # permite leer los mensajes antiguos o vacía el historial?
            # Según requerimiento original: "los mensajes se borrar luego de que inicia la hora del partido"
            # Si permitimos ver el historial después de la hora del partido, el chat no parecería cerrado.
            # Pero si vaciamos el queryset, el frontend mostrará "Chat cerrado".
            
            if timezone.now() >= match.start_time:
                # Comentar esta línea temporalmente para depuración si es necesario, 
                # pero es lo que pide el requerimiento.
                return ChatMessage.objects.none()

            return ChatMessage.objects.filter(match=match).order_by('created_at')

        except OpenMatch.DoesNotExist:
            return ChatMessage.objects.none()
        except Exception as e:
            return ChatMessage.objects.none()
