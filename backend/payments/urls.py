from django.urls import path
from .views import PaymentList, PaymentDetail

urlpatterns = [
    path('', PaymentList.as_view()),
    path('<int:pk>/', PaymentDetail.as_view()),
]
