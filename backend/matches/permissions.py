from rest_framework.permissions import BasePermission

class IsMatchCreator(BasePermission):
    """
    Permite el acceso solo al creador de un partido.
    """
    def has_object_permission(self, request, view, obj):
        # obj es la instancia de OpenMatch
        return obj.creator == request.user
