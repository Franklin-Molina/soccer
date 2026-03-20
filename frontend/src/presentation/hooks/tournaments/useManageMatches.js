import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useUseCases } from '../../context/UseCaseContext';

export function useManageMatches(initialMatches = []) {
  const { updateMatchScoreUseCase } = useUseCases();
  
  const [matches, setMatches] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (initialMatches && initialMatches.length > 0) {
      setMatches(initialMatches);
    }
  }, [initialMatches]);

  // 🔥 Asegúrate de que matchId esté aquí en los parámetros
  const handleUpdateScore = async (matchId, teamAScore, teamBScore, isFinished = false) => {
    setIsUpdating(true);
    try {
      // Usamos el formato que tu backend espera
      const scoreData = {
        score1: teamAScore,
        score2: teamBScore,
        status: isFinished ? 'completed' : 'pending', 
      };

      // Enviamos el matchId y la data
      const updatedMatch = await updateMatchScoreUseCase.execute(matchId, scoreData);
      
      setMatches(prevMatches => 
        prevMatches.map(m => m.id === matchId ? { ...m, ...updatedMatch } : m)
      );
      
      toast.success(isFinished ? '¡Partido finalizado con éxito!' : 'Marcador actualizado');
    } catch (error) {
      toast.error('Error al actualizar el marcador. Verifica tu conexión.');
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return { matches, handleUpdateScore, isUpdating };
}