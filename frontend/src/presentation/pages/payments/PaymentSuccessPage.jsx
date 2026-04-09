import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Home, Calendar, Loader2, AlertTriangle } from 'lucide-react';
import api from '../../../infrastructure/api/api';
import { useBookingsRealtime } from '../../hooks/bookings/useBookingsRealtime';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState('processing');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const verifyAttempted = useRef(false);

  // Sincronización en tiempo real vía WebSocket
  useBookingsRealtime(useCallback((event) => {
    console.log('Real-time update in Success Page:', event);
    if (event.type === 'booking_updated') {
      const booking = event.booking;
      // Si el pago asociado a esta reserva es 'late_payment', actualizamos la UI
      // Nota: El backend envía el estado del pago dentro de la reserva o podemos inferirlo del status de la reserva
      if (booking.status === 'expired') {
        setPaymentStatus('late_payment');
      } else if (booking.status === 'confirmed') {
        setPaymentStatus('success');
      }
    }
  }, []));

  useEffect(() => {
    const verifyPayment = async () => {
      if (verifyAttempted.current) return;
      verifyAttempted.current = true;

      // Wompi redirige con 'id' para la transacción
      const transactionId = searchParams.get('id') || searchParams.get('transaction_id');
      const statusFromUrl = searchParams.get('status');
      
      console.log("PaymentSuccessPage - URL Params:", { 
        transactionId, 
        statusFromUrl, 
        raw: searchParams.toString() 
      });

      if (!transactionId) {
        console.warn("No se encontró transactionId en la URL");
        setLoading(false);
        if (statusFromUrl === 'APPROVED') setPaymentStatus('success');
        else if (statusFromUrl === 'DECLINED') setPaymentStatus('failed');
        return;
      }

      try {
        setLoading(true);
        console.log(`Llamando a verificación del backend para ID: ${transactionId}...`);
        // Llamamos al backend para verificar oficialmente el estado
        const response = await api.get(`/api/payments/wompi/verify/${transactionId}/`);
        console.log("Respuesta del backend:", response.data);
        
        if (response.data.status === 'completed') {
          setPaymentStatus('success');
        } else if (response.data.status === 'late_payment') {
          setPaymentStatus('late_payment');
        } else if (response.data.status === 'failed') {
          setPaymentStatus('failed');
        } else {
          setPaymentStatus('processing');
        }
      } catch (err) {
        console.error("Error verificando pago:", err);
        const backendError = err.response?.data?.error || err.message;
        setError(`Error de verificación: ${backendError}`);
        
        // Fallback al estado de la URL si el backend falla
        if (statusFromUrl === 'APPROVED') setPaymentStatus('success');
        else if (statusFromUrl === 'DECLINED') setPaymentStatus('failed');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {loading ? (
          <div className="flex flex-col items-center py-10">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Verificando tu transacción...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 p-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}
            
            {paymentStatus === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              ¡Pago Exitoso!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Tu reserva ha sido confirmada. Recibirás un correo con los detalles de tu reserva.
            </p>
          </>
        )}

        {paymentStatus === 'failed' && (
          <>
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Pago Declinado
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              No se pudo procesar tu pago. Puedes intentarlo de nuevo o contactar a soporte.
            </p>
          </>
        )}

        {paymentStatus === 'late_payment' && (
          <>
            <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-12 h-12 text-amber-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Pago Tardío
            </h1>
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
              <p className="text-amber-800 dark:text-amber-300 text-sm font-medium">
                Recibimos tu pago, pero el tiempo límite de la reserva expiró.
              </p>
              <p className="text-amber-700 dark:text-amber-400 text-xs mt-2">
                La reserva no pudo ser garantizada. Por favor, contacta a soporte para gestionar un crédito o reembolso, o intenta realizar una nueva reserva.
              </p>
            </div>
          </>
        )}

        {paymentStatus === 'processing' && (
          <>
            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-12 h-12 text-yellow-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Procesando Pago
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Tu pago está siendo procesado. Recibirás una confirmación pronto.
            </p>
          </>
        )}
        </>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/client"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow transition-colors"
          >
            <Home className="w-5 h-5" />
            Ir al Inicio
          </Link>
          <Link
            to="/client/bookings"
            className="inline-flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-6 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <Calendar className="w-5 h-5" />
            Ver Mis Reservas
          </Link>
        </div>
      </div>
    </div>
  );
}