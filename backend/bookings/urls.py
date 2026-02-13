from django.urls import path, include # Importar include
from rest_framework.routers import DefaultRouter # Importar DefaultRouter
from .views import BookingViewSet, BookingStatsView # Importar BookingViewSet

# Crear una instancia del router
router = DefaultRouter()

# Registrar el ViewSet con el router y especificar basename
router.register(r'bookings', BookingViewSet, basename='booking')

# Las URLs generadas por el router se incluyen en urlpatterns
urlpatterns = [
    path('stats/', BookingStatsView.as_view(), name='booking-stats'),
    path('', include(router.urls)),
]
