import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
// 🔥 Importación corregida (en plural)
import { useUseCases } from '../../context/UseCaseContext'; 

export function useManageTournaments() {
  // 🔥 Extraemos solo los casos de uso específicos que necesitamos
  const { 
    getTournamentsUseCase, 
    deleteTournamentUseCase,
    generateFixtureUseCase 
  } = useUseCases(); 
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTournaments = useCallback(async () => {
    setLoading(true);
    try {
      // 🔥 Usamos el método execute() del caso de uso
      const data = await getTournamentsUseCase.execute(); 
      setTournaments(data);
    } catch (error) {
      toast.error('Error al cargar la lista de torneos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [getTournamentsUseCase]);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('¿Estás seguro de eliminar este torneo? Esta acción borrará todos los equipos y partidos asociados.');
    
    if (!confirmDelete) return;
    
    try {
      // 🔥 Usamos el método execute() del caso de uso
      await deleteTournamentUseCase.execute(id);
      toast.success('Torneo eliminado correctamente');
      setTournaments(prevTournaments => prevTournaments.filter(t => t.id !== id));
    } catch (error) {
      toast.error('Ocurrió un error al intentar eliminar el torneo');
      console.error(error);
    }
  };

  const handleGenerateFixture = async (id) => {
    const confirmFixture = window.confirm('¿Deseas generar el fixture para este torneo? Esto cerrará las inscripciones y creará los partidos de la primera ronda.');
    
    if (!confirmFixture) return;

    try {
      await generateFixtureUseCase.execute(id);
      toast.success('Fixture generado correctamente');
      // Recargamos la lista para ver el cambio de estado
      fetchTournaments();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al generar el fixture');
      console.error(error);
    }
  };

  return { 
    tournaments, 
    loading, 
    fetchTournaments, 
    handleDelete,
    handleGenerateFixture
  };
}
