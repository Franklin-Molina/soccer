import uuid
import logging
from django.db import transaction
from rest_framework import status, views # Importar status y views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny # Asumir permisos
from asgiref.sync import async_to_sync
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from .models import Payment
from .serializers import PaymentSerializer
from .services.wompi_service import wompi_service
from bookings.utils.websocket_notifier import booking_notifier
from bookings.serializers import BookingSerializer

# Importar casos de uso y repositorio
from .infrastructure.repositories.django_payment_repository import DjangoPaymentRepository
from .application.use_cases.create_payment import CreatePaymentUseCase
from .application.use_cases.get_payment_list import GetPaymentListUseCase
from .application.use_cases.get_payment_details import GetPaymentDetailsUseCase
from .application.use_cases.update_payment_status import UpdatePaymentStatusUseCase

logger = logging.getLogger(__name__)

class PaymentList(views.APIView):
    permission_classes = [IsAuthenticated] # Ajustar permisos según sea necesario

    def get(self, request, *args, **kwargs):
        payment_repository = DjangoPaymentRepository()
        get_payment_list_use_case = GetPaymentListUseCase(payment_repository)
        
        user_filter = request.user if not request.user.is_staff else None
        filters = request.query_params.dict()

        payments = async_to_sync(get_payment_list_use_case.execute)(user=user_filter, filters=filters)
        serializer = PaymentSerializer(payments, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        payment_repository = DjangoPaymentRepository()
        create_payment_use_case = CreatePaymentUseCase(payment_repository)
        
        serializer = PaymentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            payment_data = serializer.validated_data
            try:
                payment = async_to_sync(create_payment_use_case.execute)(payment_data, user=request.user)
                response_serializer = PaymentSerializer(payment, context={'request': request})
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            except ValueError as e:
                 return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"error": "Error interno al crear el pago."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PaymentDetail(views.APIView):
    permission_classes = [IsAuthenticated] # Ajustar permisos

    def get(self, request, pk, *args, **kwargs):
        payment_repository = DjangoPaymentRepository()
        get_payment_details_use_case = GetPaymentDetailsUseCase(payment_repository)
        
        user_filter = request.user if not request.user.is_staff else None
        payment = async_to_sync(get_payment_details_use_case.execute)(payment_id=pk, user=user_filter)
        
        if payment:
            serializer = PaymentSerializer(payment, context={'request': request})
            return Response(serializer.data)
        return Response(status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, pk, *args, **kwargs): # Usar PATCH para actualizar estado
        payment_repository = DjangoPaymentRepository()
        update_payment_status_use_case = UpdatePaymentStatusUseCase(payment_repository)
        
        new_status = request.data.get('status')
        if not new_status:
            return Response({"error": "El campo 'status' es requerido."}, status=status.HTTP_400_BAD_REQUEST)

        user_filter = request.user if not request.user.is_staff else None
        
        try:
            payment = async_to_sync(update_payment_status_use_case.execute)(
                payment_id=pk, 
                status=new_status, 
                user=user_filter
            )
            if payment:
                serializer = PaymentSerializer(payment, context={'request': request})
                return Response(serializer.data)
            return Response({"detail": "Pago no encontrado o no tienes permiso para modificarlo."}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": "Error interno al actualizar el estado del pago."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    # DELETE podría no ser necesario si los pagos no se eliminan físicamente.
    # Si se necesita, se puede implementar un caso de uso y método similar.


class WompiCheckoutView(views.APIView):
    """
    Vista para iniciar el checkout con Wompi.
    Crea una transacción y devuelve la URL de pago.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        booking_id = request.data.get('booking_id')
        if not booking_id:
            return Response({"error": "booking_id es requerido."}, status=status.HTTP_400_BAD_REQUEST)

        # Obtener la reserva
        from bookings.models import Booking
        try:
            booking = Booking.objects.select_related('user', 'court').get(id=booking_id)
        except Booking.DoesNotExist:
            return Response({"error": "Reserva no encontrada."}, status=status.HTTP_404_NOT_FOUND)

        # Verificar que la reserva pertenezca al usuario
        if booking.user != request.user:
            return Response({"error": "No tienes permiso para pagar esta reserva."}, status=status.HTTP_403_FORBIDDEN)

        # Verificar que no tenga un pago completado
        existing_payment = Payment.objects.filter(booking=booking, status='completed').first()
        if existing_payment:
            return Response({"error": "Esta reserva ya está pagada."}, status=status.HTTP_400_BAD_REQUEST)

        # Verificar si la reserva ha expirado (Capa 2 de seguridad)
        if booking.is_expired:
            booking.status = 'expired'
            booking.save()
            return Response({
                "error": "RESERVA_EXPIRADA",
                "message": "El tiempo para pagar ha finalizado. Por favor, selecciona el horario nuevamente."
            }, status=status.HTTP_400_BAD_REQUEST)

        # Generar referencia única
        reference = f"booking-{booking.id}-{uuid.uuid4().hex[:8]}"
        
        # Convertir monto a centavos
        amount_cents = int(booking.court.price * 100) if hasattr(booking.court, 'price') else int(float(booking.court.price) * 100)
        
        # Crear checkout en Wompi
        result = wompi_service.create_checkout(
            reference=reference,
            amount_in_cents=amount_cents,
            customer_email=request.user.email,
            customer_name=f"{request.user.first_name} {request.user.last_name}".strip()
        )

        if not result.get("success"):
            return Response({"error": result.get("error", "Error al crear el pago")}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Crear registro de pago en la base de datos
        # Nota: transaction_id será nulo hasta que el webhook lo actualice
        payment = Payment.objects.create(
            user=request.user,
            booking=booking,
            amount=booking.court.price if hasattr(booking.court, 'price') else 0,
            status='pending',
            gateway='wompi',
            reference=reference,
            payment_link=result.get("payment_url"),
            gateway_data=result.get("raw_response")
        )

        return Response({
            "payment_id": payment.id,
            "reference": reference,
            "payment_url": result.get("payment_url"),
            "amount": float(payment.amount),
        }, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class WompiWebhookView(views.APIView):
    """
    Vista para recibir notificaciones de Wompi.
    No requiere autenticación - Wompi envía las notificaciones directamente.
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        try:
            # Validar firma del webhook (si está configurada)
            signature = request.headers.get('X-Signature-256', '')
            body = request.body.decode('utf-8')
            
            if not wompi_service.validate_webhook_signature(body, signature):
                logger.warning("Firma de webhook inválida")
                return Response({"error": "Firma inválida"}, status=status.HTTP_401_UNAUTHORIZED)

            # Parsear datos
            import json
            event_data = json.loads(body)
            # logger.info(f"Webhook de Wompi recibido: {event_data}")

            # Procesar evento
            event_info = wompi_service.process_webhook_event(event_data)
            
            if event_info.get("action") == "payment_status_update":
                reference = event_info.get("reference")
                new_status = event_info.get("status")
                transaction_id = event_info.get("transaction_id")
                
                logger.info(f"Procesando webhook para referencia: {reference}, status: {new_status}, transaction_id: {transaction_id}")

                # Mapear estado de Wompi a nuestro modelo
                status_map = {
                    "APPROVED": "completed",
                    "DECLINED": "failed",
                    "VOIDED": "failed", 
                    "ERROR": "failed",
                }
                payment_status = status_map.get(new_status, "pending")

                # Actualizar pago y reserva de forma atómica
                try:
                    with transaction.atomic():
                        # Usar iexact para evitar problemas de mayúsculas/minúsculas
                        payment = Payment.objects.select_for_update().get(reference__iexact=reference)
                        logger.info(f"Pago encontrado ID: {payment.id}, estado actual: {payment.status}")
                        
                        payment.status = payment_status
                        payment.transaction_id = transaction_id
                        payment.method = event_info.get("payment_method", "other")
                        payment.gateway_data = event_data
                        payment.save()

                        # Actualizar reserva según el estado del pago
                        booking = payment.booking
                        if payment_status == "completed":
                            # 🔥 VALIDACIÓN FINAL: Defensa contra pagos tardíos (Capa 4)
                            # Si la reserva ya está marcada como expirada o si el tiempo pasó (is_expired lo valida)
                            if booking.is_expired or booking.status == 'expired':
                                logger.warning(f"PAGO TARDÍO RECIBIDO vía Webhook: Reserva {booking.id} ya expiró. Marcando pago como late_payment.")
                                payment.status = 'late_payment'
                                payment.save()
                                
                                # Aseguramos que la reserva esté marcada como expirada
                                if booking.status != 'expired':
                                    booking.status = 'expired'
                                    booking.save()
                                
                                # Notificar estado de pago tardío vía WebSocket
                                serializer = BookingSerializer(booking)
                                transaction.on_commit(lambda: booking_notifier.notify_booking_updated(serializer.data))
                                
                                logger.info(f"Reserva {booking.id} marcada como EXPIRED debido a pago tardío {reference}")
                            else:
                                booking.status = "confirmed"
                                booking.payment = payment  # Vincular el pago exitoso
                                booking.save()
                                logger.info(f"Reserva {booking.id} CONFIRMADA por pago {reference}")
                                
                                # Notificar actualización de reserva via WebSocket
                                serializer = BookingSerializer(booking)
                                transaction.on_commit(lambda: booking_notifier.notify_booking_updated(serializer.data))
                            
                        elif payment_status == "failed":
                            booking.status = "cancelled"
                            booking.save()
                            logger.info(f"Reserva {booking.id} CANCELADA por pago fallido o anulado {reference} (Estado Wompi: {new_status})")
                            
                            # Notificar liberación de la reserva vía WebSocket después de la transacción
                            transaction.on_commit(lambda: booking_notifier.notify_booking_cancelled(booking.id))

                    logger.info(f"Pago {reference} actualizado exitosamente a {payment_status}")
                except Payment.DoesNotExist:
                    logger.error(f"Pago con referencia {reference} no encontrado")
                    return Response({"error": "Pago no encontrado"}, status=status.HTTP_404_NOT_FOUND)

            return Response({"status": "ok"}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error procesando webhook de Wompi: {str(e)}")
            return Response({"error": "Error interno"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class WompiVerifyPaymentView(views.APIView):
    """
    Vista para verificar el estado de un pago manualmente usando el transaction_id.
    Útil para el flujo de redirección (Success Page).
    """
    permission_classes = [AllowAny]
    authentication_classes = [] # Deshabilitar para evitar problemas de CSRF/Cookies en la redirección

    def get(self, request, transaction_id, *args, **kwargs):
        logger.info(f"VERIFICACIÓN MANUAL - Recibido ID: {transaction_id}")
        
        # Consultar estado en Wompi API
        result = wompi_service.verify_payment(transaction_id)
        
        if not result.get("success"):
            logger.error(f"VERIFICACIÓN MANUAL - Falló consulta a Wompi: {result.get('error')}")
            return Response({"error": result.get("error", "Error al verificar el pago")}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        reference = result.get("reference")
        new_status = result.get("status") # APPROVED, DECLINED, etc.
        logger.info(f"VERIFICACIÓN MANUAL - Wompi responde: status={new_status}, reference={reference}")
        
        # Mapear estado
        status_map = {
            "APPROVED": "completed",
            "DECLINED": "failed",
            "VOIDED": "failed",
            "ERROR": "failed",
        }
        payment_status = status_map.get(new_status, "pending")

        try:
            with transaction.atomic():
                # Buscar el pago por referencia (iexact para mayor compatibilidad)
                payment = Payment.objects.select_for_update().get(reference__iexact=reference)
                logger.info(f"VERIFICACIÓN MANUAL - Pago local encontrado ID: {payment.id}, DB Status: {payment.status}")
                
                # Siempre guardamos el transaction_id si no estaba o si el estado cambió
                if payment.status != payment_status or payment.transaction_id != transaction_id:
                    payment.status = payment_status
                    payment.transaction_id = transaction_id
                    payment.method = result.get("payment_method", "other")
                    payment.gateway_data = result.get("raw_response")
                    payment.save()
                    logger.info(f"VERIFICACIÓN MANUAL - Registro de pago actualizado a {payment_status}")

                    # Actualizar reserva
                    booking = payment.booking
                    if payment_status == "completed" and booking.status != "confirmed":
                        # 🔥 VALIDACIÓN FINAL: Defensa contra pagos tardíos (Capa 4)
                        # Si la reserva ya está marcada como expirada o si el tiempo pasó
                        if booking.is_expired or booking.status == 'expired':
                            logger.warning(f"PAGO TARDÍO RECIBIDO vía Verificación: Reserva {booking.id} ya expiró. Marcando pago como late_payment.")
                            payment.status = 'late_payment'
                            payment.save()
                            
                            if booking.status != 'expired':
                                booking.status = 'expired'
                                booking.save()
                            
                            # Notificar
                            serializer = BookingSerializer(booking)
                            transaction.on_commit(lambda: booking_notifier.notify_booking_updated(serializer.data))
                            
                            # No confirmamos la reserva, pero informamos al usuario
                            return Response({
                                "status": "late_payment",
                                "message": "El pago fue exitoso pero se realizó fuera del tiempo límite. La reserva no pudo ser confirmada.",
                                "reference": reference
                            }, status=status.HTTP_200_OK)

                        booking.status = "confirmed"
                        booking.payment = payment
                        booking.save()
                        
                        # Notificar
                        serializer = BookingSerializer(booking)
                        transaction.on_commit(lambda: booking_notifier.notify_booking_updated(serializer.data))
                        logger.info(f"Reserva {booking.id} CONFIRMADA vía verificación manual")
                        
                    elif payment_status == "failed" and booking.status != "cancelled":
                        booking.status = "cancelled"
                        booking.save()
                        
                        # Notificar
                        transaction.on_commit(lambda: booking_notifier.notify_booking_cancelled(booking.id))
                        logger.info(f"Reserva {booking.id} CANCELADA vía verificación manual")

            return Response({
                "status": payment_status,
                "wompi_status": new_status,
                "reference": reference,
                "booking_status": booking.status if 'booking' in locals() else None
            }, status=status.HTTP_200_OK)

        except Payment.DoesNotExist:
            logger.error(f"Pago con referencia {reference} no encontrado durante verificación manual")
            return Response({"error": "Pago no encontrado en base de datos local"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error en verificación manual de pago: {str(e)}")
            return Response({"error": "Error interno"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
