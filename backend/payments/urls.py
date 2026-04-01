from django.urls import path
from .views import PaymentList, PaymentDetail, WompiCheckoutView, WompiWebhookView

urlpatterns = [
    path('', PaymentList.as_view()),
    path('<int:pk>/', PaymentDetail.as_view()),
    # Wompi
    path('wompi/checkout/', WompiCheckoutView.as_view(), name='wompi-checkout'),
    path('wompi/webhook/', WompiWebhookView.as_view(), name='wompi-webhook'),
]
