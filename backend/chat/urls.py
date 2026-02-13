from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatMessageViewSet

router = DefaultRouter()
router.register(r'messages', ChatMessageViewSet, basename='chatmessage')

# Definimos las URLs de la app de chat.
urlpatterns = [
    path('', include(router.urls)),
]
