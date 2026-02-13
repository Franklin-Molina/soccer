import { useEffect, useRef } from 'react';
import { useUseCases } from '../../context/UseCaseContext';
import { useNotification } from '../../context/NotificationContext';

/**
 * Hook para monitorizar nuevas reservas en segundo plano.
 * (La funcionalidad de notificación se ha movido a Notification.jsx vía WebSockets)
 */
export const useBookingNotifier = (enabled = false) => {
  const { getBookingsUseCase } = useUseCases();
  // const { showNotification } = useNotification(); // Comentado para evitar duplicados
  const bookingsRef = useRef([]);

  useEffect(() => {
    if (!enabled) {
      return; 
    }

    const fetchAndNotify = async () => {
      try {
        const newBookingsData = await getBookingsUseCase.execute(1) || [];
        // Se mantiene la actualización de la referencia por si se necesita en el futuro,
        // pero se elimina la llamada a showNotification.
        bookingsRef.current = newBookingsData;
      } catch (error) {
        console.error('Error al verificar nuevas reservas:', error);
      }
    };

    getBookingsUseCase.execute(1).then(initialBookings => {
      bookingsRef.current = initialBookings || [];
    });

    const interval = setInterval(fetchAndNotify, 10000);

    return () => clearInterval(interval);
  }, [enabled, getBookingsUseCase]);
};
