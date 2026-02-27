import { useEffect } from 'react';
import { matchesWebSocket } from '../../../infrastructure/websocket/matchesWebSocket';

export const useMatchesRealtime = (onUpdate) => {
  useEffect(() => {
    matchesWebSocket.connect();

    const unsubscribe = matchesWebSocket.subscribe(onUpdate);

    return () => {
      unsubscribe();
    };
  }, []); // 🔥 dependencia vacía
};
