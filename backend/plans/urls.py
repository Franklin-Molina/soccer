from django.urls import path
from .views import PlanList, PlanDetail

urlpatterns = [
    path('', PlanList.as_view()),
    path('<int:pk>/', PlanDetail.as_view()),
]
