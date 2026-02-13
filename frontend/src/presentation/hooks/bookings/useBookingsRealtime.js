import { useEffect, useCallback } from 'react';
import { bookingsWebSocket } from '../../../infrastructure/websocket/bookingsWebSocket';

/**
 * Hook para manejar actualizaciones de reservas en tiempo real vía WebSocket.
 * @param {Function} onUpdate - Callback que se ejecuta cuando llega un mensaje del servidor.
 */
export const useBookingsRealtime = (onUpdate) => {
  useEffect(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token') || localStorage.getItem('access_token');
    
    if (!token) {
    //  console.warn('No token found for Bookings WebSocket');
      return;
    }

    bookingsWebSocket.connect(token);

    const unsubscribe = bookingsWebSocket.subscribe((data) => {
      if (onUpdate) {
        onUpdate(data);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [onUpdate]);

  return {};
};

