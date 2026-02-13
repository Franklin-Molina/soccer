from django.urls import path
from .views import CourtList, CourtDetail, CourtAvailabilityView, CourtWeeklyAvailabilityView # Importar CourtWeeklyAvailabilityView

urlpatterns = [
    path('', CourtList.as_view()),
    path('<int:pk>/', CourtDetail.as_view()),
    path('<int:court_id>/weekly-availability/', CourtWeeklyAvailabilityView.as_view(), name='court-weekly-availability'), # Añadir URL para disponibilidad semanal
    path('availability/', CourtAvailabilityView.as_view(), name='court-availability'), # Añadir URL para disponibilidad
]
