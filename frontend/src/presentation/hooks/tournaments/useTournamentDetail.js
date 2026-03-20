import { useState, useEffect, useCallback } from 'react';
import { ApiTournamentRepository } from '../../../infrastructure/repositories/api-tournament-repository';

export const useTournamentDetail = (id) => {
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tournamentRepository = new ApiTournamentRepository();

  const fetchTournamentDetail = useCallback(async (isRefresh = false) => {
    if (!id) return;
    try {
      if (!isRefresh) setLoading(true);
      const data = await tournamentRepository.getTournamentById(id);
      setTournament(data);
    } catch (err) {
      setError(err);
    } finally {
      if (!isRefresh) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTournamentDetail();
  }, [fetchTournamentDetail]);

  const enrollTeam = async (teamName) => {
    try {
      setIsSubmitting(true);
      const result = await tournamentRepository.enrollTeam(id, teamName);
      await fetchTournamentDetail(); // Recargar datos para ver el nuevo equipo
      return result;
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateFixture = async () => {
    try {
      setIsSubmitting(true);
      const result = await tournamentRepository.generateFixture(id);
      await fetchTournamentDetail(); // Recargar datos para ver los nuevos partidos
      return result;
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { 
    tournament, 
    loading, 
    error, 
    isSubmitting, 
    enrollTeam, 
    generateFixture,
    refresh: fetchTournamentDetail 
  };
};
