import { useState, useEffect } from 'react';
import { ApiTournamentRepository } from '../../../infrastructure/repositories/api-tournament-repository';

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
  }, []);

  return { tournaments, loading, error, refresh: fetchTournaments };
};
