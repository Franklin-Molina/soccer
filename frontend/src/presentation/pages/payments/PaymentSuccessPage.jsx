import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Home, Calendar } from 'lucide-react';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState('processing');

  useEffect(() => {
    const status = searchParams.get('status');
    const reference = searchParams.get('reference');
    const transactionId = searchParams.get('transaction_id');

    if (status === 'APPROVED') {
      setPaymentStatus('success');
    } else if (status === 'DECLINED') {
      setPaymentStatus('failed');
    } else {
      setPaymentStatus('processing');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
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