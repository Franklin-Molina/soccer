import { useState, useEffect } from 'react';
import { ApiTournamentRepository } from '../../../infrastructure/repositories/api-tournament-repository';
import { tournamentsWebSocket } from '../../../infrastructure/websocket/tournamentsWebSocket';

export const useTournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tournamentRepository = new ApiTournamentRepository();

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const data = await tournamentRepository.getTournaments();
      setTournaments(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();

    // Conectar al WebSocket de la lista de torneos (sin ID)
    tournamentsWebSocket.connect();

    const unsubscribe = tournamentsWebSocket.subscribe((data) => {
      // console.log('🏆 WebSocket Torneos Recibido:', data);
      
      if (data.type === 'tournament_created') {
        setTournaments(prev => [data.tournament, ...prev]);
      } 
      else if (data.type === 'tournament_updated') {
        setTournaments(prev => prev.map(t => t.id === data.tournament.id ? data.tournament : t));
      } 
      else if (data.type === 'tournament_deleted') {
        setTournaments(prev => prev.filter(t => t.id !== data.tournament_id));
      }
    });

    return () => {
      unsubscribe();
      // Nota: No desconectamos el WS aquí para permitir otras suscripciones paralelas si existen
    };
  }, []);

  return { tournaments, loading, error, refresh: fetchTournaments };
};
