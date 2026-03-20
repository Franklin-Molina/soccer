import { useEffect } from 'react';
import { tournamentsWebSocket } from '../../../infrastructure/websocket/tournamentsWebSocket';

export const useTournamentsWebSocket = (tournamentId, onMessage) => {
  useEffect(() => {
    if (!tournamentId) return;

    tournamentsWebSocket.connect(tournamentId);
    
    const unsubscribe = tournamentsWebSocket.subscribe(onMessage);

    return () => {
      unsubscribe();
    };
  }, [tournamentId, onMessage]);

  return {
    disconnect: () => tournamentsWebSocket.disconnect(),
  };
};
