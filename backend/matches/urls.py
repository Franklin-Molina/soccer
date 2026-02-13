from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OpenMatchViewSet

router = DefaultRouter()
router.register(r'open-matches', OpenMatchViewSet, basename='openmatch')

urlpatterns = [
    path('', include(router.urls)),
]
