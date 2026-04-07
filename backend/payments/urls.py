from django.urls import path
from .views import PaymentList, PaymentDetail, WompiCheckoutView, WompiWebhookView, WompiVerifyPaymentView

urlpatterns = [
    path('', PaymentList.as_view()),
    path('<int:pk>/', PaymentDetail.as_view()),
    # Wompi
    path('wompi/checkout/', WompiCheckoutView.as_view(), name='wompi-checkout'),
    path('wompi/webhook/', WompiWebhookView.as_view(), name='wompi-webhook'),
    path('wompi/verify/<str:transaction_id>/', WompiVerifyPaymentView.as_view(), name='wompi-verify'),
]
