from rest_framework import status, views # Importar status y views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser # Asumir permisos
from asgiref.sync import async_to_sync

from .models import Payment
from .serializers import PaymentSerializer

# Importar casos de uso y repositorio
from .infrastructure.repositories.django_payment_repository import DjangoPaymentRepository
from .application.use_cases.create_payment import CreatePaymentUseCase
from .application.use_cases.get_payment_list import GetPaymentListUseCase
from .application.use_cases.get_payment_details import GetPaymentDetailsUseCase
from .application.use_cases.update_payment_status import UpdatePaymentStatusUseCase

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
