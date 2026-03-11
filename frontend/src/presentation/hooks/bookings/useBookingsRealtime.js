import { useEffect } from 'react';
import { bookingsWebSocket } from '../../../infrastructure/websocket/bookingsWebSocket';
import { useAuth } from '../../context/AuthContext.jsx'; // Asegúrate de que esta ruta sea correcta

/**
 * Hook para manejar actualizaciones de reservas en tiempo real vía WebSocket.
 * @param {Function} onUpdate - Callback que se ejecuta cuando llega un mensaje del servidor.
 */
export const useBookingsRealtime = (onUpdate) => {
  // 1. Traemos el estado de autenticación
  const { isAuthenticated } = useAuth(); 

  useEffect(() => {
    // 2. REGLA DE ORO: Si no hay sesión, no hacemos absolutamente nada.
    if (!isAuthenticated) return;

    // Si pasamos el filtro de arriba, significa que hay sesión válida. ¡Conectamos!
    bookingsWebSocket.connect();

    const unsubscribe = bookingsWebSocket.subscribe((data) => {
      if (onUpdate) {
        onUpdate(data);
      }
    });

    return () => {
      // Limpiamos la suscripción del componente actual
      unsubscribe();
      
      // Nota: No llamamos a bookingsWebSocket.disconnect() aquí porque 
      // si el usuario navega de "Dashboard" a "Perfil", no queremos 
      // matar el WebSocket, solo quitar la suscripción de esta vista.
      // El apagado total del WebSocket ya lo estamos manejando en tu AuthContext.jsx al hacer logout.
    };
  }, [onUpdate, isAuthenticated]); // 3. Agregamos isAuthenticated a las dependencias

  return {};
};