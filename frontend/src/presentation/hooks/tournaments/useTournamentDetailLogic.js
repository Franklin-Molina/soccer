import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUseCases } from '../../context/UseCaseContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useTournamentsWebSocket } from './useTournamentsWebSocket';

export const useTournamentDetailLogic = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getTournamentByIdUseCase, enrollTeamUseCase, generateFixtureUseCase } = useUseCases();
  
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [teamName, setTeamName] = useState('');

  const fetchTournamentDetail = useCallback(async (isRefresh = false) => {
    if (!id) return;
    try {
      if (!isRefresh) setLoading(true);
      const data = await getTournamentByIdUseCase.execute(id);
      setTournament(data);
    } catch (err) {
      setError(err);
      console.error('Error fetching tournament detail:', err);
    } finally {
      if (!isRefresh) setLoading(false);
    }
  }, [id, getTournamentByIdUseCase]);

  useEffect(() => {
    fetchTournamentDetail();
  }, [fetchTournamentDetail]);

  // WebSocket logic
  useTournamentsWebSocket(id, useCallback((data) => {
    if (data.type === 'match_updated' || data.type === 'tournament_updated') {
      fetchTournamentDetail(true);
    } else if (data.type === 'tournament_deleted') {
      toast.info('Este torneo ha sido eliminado');
      navigate('/tournaments');
    }
  }, [fetchTournamentDetail, navigate]));

  const handleEnrollClick = () => {
    if (!user) {
      setShowLoginModal(true);
    } else {
      setShowRegistrationModal(true);
    }
  };

  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) {
      toast.error('El nombre del equipo es obligatorio');
      return;
    }

    try {
      setIsSubmitting(true);
      await enrollTeamUseCase.execute(id, teamName);
      setShowRegistrationModal(false);
      setTeamName('');
      toast.success(`¡Excelente! El equipo "${teamName}" ha sido pre-inscrito. Revisa tu correo para el pago.`);
      await fetchTournamentDetail(true);
    } catch (err) {
      const message = err.response?.data?.error || 'Error al inscribir el equipo';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateFixture = async () => {
    if (!window.confirm('¿Estás seguro de generar el fixture? Esto borrará los encuentros actuales.')) return;

    try {
      setIsSubmitting(true);
      await generateFixtureUseCase.execute(id);
      toast.success('¡Fixture generado con éxito!');
      setActiveTab('fixture');
      await fetchTournamentDetail(true);
    } catch (err) {
      const message = err.response?.data?.error || 'Error al generar el fixture';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    id,
    user,
    tournament,
    loading,
    error,
    isSubmitting,
    activeTab,
    setActiveTab,
    showLoginModal,
    setShowLoginModal,
    showRegistrationModal,
    setShowRegistrationModal,
    teamName,
    setTeamName,
    handleEnrollClick,
    handleSubmitRegistration,
    handleGenerateFixture,
    refresh: fetchTournamentDetail
  };
};
