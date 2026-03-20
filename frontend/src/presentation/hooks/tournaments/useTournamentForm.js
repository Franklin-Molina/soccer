import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useUseCases } from '../../context/UseCaseContext'; 
import useButtonDisable from '../general/useButtonDisable';

export function useTournamentForm(tournamentId = null) {
  const { 
    getTournamentByIdUseCase, 
    createTournamentUseCase, 
    updateTournamentUseCase 
  } = useUseCases();
  const navigate = useNavigate();
  
  const [initialLoading, setInitialLoading] = useState(!!tournamentId);
  
  // Estado inicial vacío (para modo Creación)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    registrationFee: '',
    maxTeams: '',
    prize: '',
    level: 'Amateur / Libre',
    format: 'Fase de Grupos + Eliminatorias',
    location: '',
    status: 'open',
    coverImage: null 
  });

  // Si hay un ID, cargamos los datos existentes (Modo Edición)
  useEffect(() => {
    if (tournamentId) {
      const loadTournamentDetails = async () => {
        try {
          const data = await getTournamentByIdUseCase.execute(tournamentId);
          setFormData({
            name: data.name || '',
            description: data.description || '',
            startDate: data.startDate || '',
            endDate: data.endDate || '',
            registrationFee: data.registrationFee || '',
            maxTeams: data.maxTeams || '',
            prize: data.prize || '',
            level: data.level || '',
            format: data.format || '',
            location: data.location || '',
            status: data.status || 'open',
            coverImage: data.coverImage || null 
          });
        } catch (error) {
          toast.error('Error al cargar los datos del torneo');
          navigate('/dashboard/tournaments'); // Sacamos al usuario si falla
        } finally {
          setInitialLoading(false);
        }
      };
      loadTournamentDetails();
    }
  }, [tournamentId, getTournamentByIdUseCase, navigate]);

  // Manejador genérico de inputs (Textos, Selects y Archivos)
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'coverImage' && files && files.length > 0) {
      setFormData(prev => ({ ...prev, coverImage: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, coverImage: null }));
  };

  // Envío al Backend usando useButtonDisable para prevenir dobles clics
  const [loadingAction, handleSubmit] = useButtonDisable(async (e) => {
    e.preventDefault();

    // Creamos el FormData para soportar la imagen
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'coverImage') {
        if (formData[key] instanceof File) {
          data.append(key, formData[key]);
        }
      } else {
        if (formData[key] !== null && formData[key] !== undefined) {
           data.append(key, formData[key]);
        }
      }
    });

    try {
      if (tournamentId) {
        await updateTournamentUseCase.execute(tournamentId, data);
        toast.success('Torneo actualizado con éxito');
      } else {
        await createTournamentUseCase.execute(data);
        toast.success('¡Torneo creado exitosamente!');
      }
      navigate('/dashboard/tournaments'); 
    } catch (error) {
      toast.error('Hubo un problema al guardar el torneo. Verifica los datos.');
      console.error(error);
      throw error; // Lanzamos el error para que useButtonDisable re-habilite si es necesario
    }
  });

  return { 
    formData, 
    handleChange, 
    handleRemoveImage,
    handleSubmit, 
    loading: loadingAction, 
    initialLoading 
  };
}