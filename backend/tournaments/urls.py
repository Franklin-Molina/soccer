from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TournamentViewSet, TournamentMatchViewSet

router = DefaultRouter()
router.register(r'matches', TournamentMatchViewSet, basename='tournament-match')
router.register(r'', TournamentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
