import { useEffect } from 'react';
import { usersWebSocket } from '../../../infrastructure/websocket/usersWebSocket';

/**
 * Hook para manejar actualizaciones de usuarios en tiempo real vía WebSocket.
 * @param {Function} onUpdate - Callback que se ejecuta cuando llega un mensaje del servidor.
 */
export const useUsersRealtime = (onUpdate) => {
  useEffect(() => {
    usersWebSocket.connect();

    const unsubscribe = usersWebSocket.subscribe((data) => {
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
