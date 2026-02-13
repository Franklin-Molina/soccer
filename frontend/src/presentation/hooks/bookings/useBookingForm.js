import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import useButtonDisable from '../general/useButtonDisable.js'; // Importar el hook personalizado para el botón

// Importar el caso de uso y la implementación del repositorio
import { ApiBookingRepository } from '../../../infrastructure/repositories/api-booking-repository';
import { CreateBookingUseCase } from '../../../application/use-cases/bookings/create-booking';
import { ApiCourtRepository } from '../../../infrastructure/repositories/api-court-repository'; // Se mantiene para inyectar en caso de uso
import { GetCourtByIdUseCase } from '../../../application/use-cases/courts/get-court-by-id';

/**
 * Hook personalizado para la lógica de la página de reserva de canchas.
 * Encapsula la obtención de detalles de la cancha, el manejo del formulario de reserva
 * y la interacción con los casos de uso de reserva.
 *
 * @returns {object} Un objeto que contiene el estado y las funciones para la reserva.
 * @property {object|null} court - Información de la cancha seleccionada.
 * @property {string} date - Fecha seleccionada para la reserva.
 * @property {Function} setDate - Setter para la fecha.
 * @property {string} startTime - Hora de inicio seleccionada.
 * @property {Function} setStartTime - Setter para la hora de inicio.
 * @property {string} endTime - Hora de fin seleccionada.
 * @property {Function} setEndTime - Setter para la hora de fin.
 * @property {boolean} loading - Indica si los datos están cargando.
 * @property {string|null} error - Mensaje de error general.
 * @property {string|null} bookingError - Mensaje de error específico de la reserva.
 * @property {boolean} isSubmitting - Indica si el formulario se está enviando.
 * @property {Function} handleSubmit - Función para manejar el envío del formulario de reserva.
 */
export const useBookingForm = () => {
  const { courtId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [court, setCourt] = useState(null);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  // Crear instancias del repositorio y casos de uso
  const bookingRepository = new ApiBookingRepository();
  const createBookingUseCase = new CreateBookingUseCase(bookingRepository);
  const courtRepository = new ApiCourtRepository(); // Se mantiene para inyectar en caso de uso
  const getCourtByIdUseCase = new GetCourtByIdUseCase(courtRepository);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate('/auth');
    }
  }, [isAuthenticated, loading, navigate]);

  // Cargar información de la cancha al montar el componente
  useEffect(() => {
    const fetchCourt = async () => {
      try {
        const courtDetails = await getCourtByIdUseCase.execute(courtId); // Usar el caso de uso
        setCourt(courtDetails);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    if (courtId) {
      fetchCourt();
    } else {
      setError(new Error("ID de cancha no proporcionado."));
      setLoading(false);
    }
  }, [courtId, getCourtByIdUseCase]); // Dependencia actualizada

  // Usar el hook para el envío del formulario
  const [isSubmitting, handleSubmit] = useButtonDisable(async (e) => {
    e.preventDefault();
    setBookingError(null);

    if (!isAuthenticated) {
      setBookingError("Debes iniciar sesión para hacer una reserva.");
      return;
    }

    const startDateTime = date && startTime ? `${date}T${startTime}:00Z` : null;
    const endDateTime = date && endTime ? `${date}T${endTime}:00Z` : null;

    if (!startDateTime || !endDateTime) {
        setBookingError("Por favor, selecciona la fecha, hora de inicio y hora de fin.");
        return;
    }

    try {
      const bookingData = {
        court: parseInt(courtId, 10),
        start_time: startDateTime,
        end_time: endDateTime,
      };
      const createdBooking = await createBookingUseCase.execute(bookingData);

      console.log('Reserva creada exitosamente:', createdBooking);
      alert(`Reserva creada exitosamente para la cancha ${court.name}.`);
      navigate('/profile');

    } catch (err) {
      console.error('Error al crear reserva:', err);
      if (err.response && err.response.data) {
        setBookingError(err.response.data.detail || JSON.stringify(err.response.data));
      } else {
        setBookingError('Error al crear la reserva. Inténtalo de nuevo.');
      }
      throw err;
    }
  });

  return {
    court,
    date,
    setDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    loading,
    error,
    bookingError,
    isSubmitting,
    handleSubmit,
  };
};
