import React, { useCallback, useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useBookingsRealtime } from '../../hooks/bookings/useBookingsRealtime';
import { useAuth } from '../../context/AuthContext';

const Notification = ({ message: propMessage, fetchAllBookings, fetchBookingStats }) => {
  const [internalMessage, setInternalMessage] = useState(null);
  const { user } = useAuth();

  // Sincronizar con el mensaje que viene por props (desde el contexto)
  useEffect(() => {
    if (propMessage) {
      setInternalMessage(propMessage);
    }
  }, [propMessage]);

  const handleRealtimeEvent = useCallback((event) => {
    if (event.type === 'booking_created') {
      const { booking } = event;

      const userName =
        `${booking.user_details?.first_name || ''} ${
          booking.user_details?.last_name ||
          booking.user_details?.username ||
          'Un usuario'
        }`.trim();

      const courtName =
        booking.court_details?.name || 'una cancha';

      // Solo mostrar notificación visual si el usuario es admin o adminglobal
      if (user && (user.role === 'admin' || user.role === 'adminglobal' || user.is_staff)) {
        setInternalMessage(`🔔 ¡Nueva Reserva! ${userName} ha reservado ${courtName}.`);
      }

      // refrescar datos si las funciones están disponibles
      if (fetchAllBookings) fetchAllBookings();
      if (fetchBookingStats) fetchBookingStats();
    }

    if (
      event.type === 'booking_updated' ||
      event.type === 'booking_cancelled'
    ) {
      if (fetchAllBookings) fetchAllBookings();
      if (fetchBookingStats) fetchBookingStats();
    }
  }, [fetchAllBookings, fetchBookingStats, user]);

  // 🔌 Escuchar eventos en tiempo real
  useBookingsRealtime(handleRealtimeEvent);

  // ⏱ Auto cerrar notificación
  useEffect(() => {
    if (!internalMessage) return;

    const timer = setTimeout(() => {
      setInternalMessage(null);
    }, 2000);

    return () => clearTimeout(timer);
  }, [internalMessage]);

  if (!internalMessage) return null;

  return (
    <div className="fixed top-6 right-6 z-50 animate-slide-in">
      <div
        className="
          min-w-[320px] flex items-center gap-4 rounded-xl px-6 py-4 shadow-2xl
          border
          bg-white text-gray-800 border-gray-200
          dark:bg-gray-900 dark:text-gray-100 dark:border-green-500/30
        "
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
          <Bell className="text-green-600 dark:text-green-500" size={20} />
        </div>

        <div>
          <h4 className="mb-1 text-sm font-semibold">
            Notificación
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {internalMessage}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Notification;
