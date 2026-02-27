import { useEffect, useCallback } from 'react';
import { bookingsWebSocket } from '../../../infrastructure/websocket/bookingsWebSocket';

/**
 * Hook para manejar actualizaciones de reservas en tiempo real vía WebSocket.
 * @param {Function} onUpdate - Callback que se ejecuta cuando llega un mensaje del servidor.
 */
export const useBookingsRealtime = (onUpdate) => {
  useEffect(() => {
    bookingsWebSocket.connect();

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

