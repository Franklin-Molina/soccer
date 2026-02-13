import { useEffect } from 'react';
import { matchesWebSocket } from '../../../infrastructure/websocket/matchesWebSocket';

export const useMatchesRealtime = (onUpdate) => {
  useEffect(() => {
    const token =
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('access_token');

    if (!token) {
      console.warn('No token found. WebSocket not connected.');
      return;
    }

    matchesWebSocket.connect(token);

    const unsubscribe = matchesWebSocket.subscribe(onUpdate);

    return () => {
      unsubscribe();
    };
  }, []); // 🔥 dependencia vacía
};
