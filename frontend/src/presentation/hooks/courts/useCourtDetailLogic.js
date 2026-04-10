import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, startOfWeek, addDays, setHours, setMinutes } from 'date-fns';
import { useRepositories } from '../../context/RepositoryContext';
import { useUseCases } from '../../context/UseCaseContext';
import { useAuth } from '../../context/AuthContext';
import { useBookingsRealtime } from '../bookings/useBookingsRealtime';
import { courtsWebSocket } from '../../../infrastructure/websocket/courtsWebSocket';
import { toast } from 'react-toastify';
import { ApiPaymentRepository } from '../../../infrastructure/repositories/api-payment-repository';

/**
 * Hook personalizado para la lógica de la página de detalles de la cancha.
 * Encapsula la obtención de detalles de la cancha, la disponibilidad semanal,
 * y la gestión del proceso de reserva.
 *
 * @returns {object} Un objeto que contiene el estado y las funciones para la página de detalles de la cancha.
 * @property {object|null} court - Detalles de la cancha.
 * @property {boolean} loading - Estado de carga inicial de la cancha.
 * @property {string|null} error - Error al cargar la cancha.
 * @property {number|null} currentImageIndex - Índice de la imagen actualmente mostrada en el modal.
 * @property {string|null} selectedImage - URL de la imagen seleccionada para el modal (basada en el índice).
 * @property {Function} handlePreviousImage - Navega a la imagen anterior en el modal.
 * @property {Function} handleNextImage - Navega a la imagen siguiente en el modal.
 * @property {boolean} isBooking - Indica si una reserva está en proceso.
 * @property {string|null} bookingError - Error específico de la reserva.
 * @property {boolean} bookingSuccess - Indica si la reserva fue exitosa.
 * @property {boolean} showLoginModal - Controla la visibilidad del modal de login.
 * @property {boolean} showConfirmModal - Controla la visibilidad del modal de confirmación de reserva.
 * @property {object|null} bookingDetailsToConfirm - Detalles de la reserva a confirmar.
 * @property {object} weeklyAvailability - Datos de disponibilidad semanal.
 * @property {boolean} loadingWeeklyAvailability - Estado de carga de la disponibilidad semanal.
 * @property {string|null} weeklyAvailabilityError - Error al cargar la disponibilidad semanal.
 * @property {Date} currentWeekStartDate - Fecha de inicio de la semana actual del calendario.
 * @property {Array} daysOfWeek - Nombres de los días de la semana.
 * @property {Array} hoursOfDay - Rangos de horas del día.
 * @property {Function} fetchCourtDetails - Función para recargar los detalles de la cancha.
 * @property {Function} handleCellClick - Manejador de clic en una celda de disponibilidad.
 * @property {Function} confirmBooking - Función para confirmar la reserva.
 * @property {Function} cancelConfirmation - Función para cancelar la confirmación de reserva.
 * @property {Function} handleCloseLoginModal - Manejador para cerrar el modal de login.
 * @property {Function} handlePreviousWeek - Navega a la semana anterior en el calendario.
 * @property {Function} handleNextWeek - Navega a la semana siguiente en el calendario.
 * @property {Function} openModal - Abre el modal de imagen.
 * @property {Function} closeModal - Cierra el modal de imagen.
 * @property {number} paymentPercentage - Porcentaje de pago seleccionado (100, 50, 10).
 * @property {Function} setPaymentPercentage - Función para actualizar el porcentaje de pago.
 */
export const useCourtDetailLogic = () => {
  const { courtId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [court, setCourt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(null);
  const [zoom, setZoom] = useState(1); // Estado para el zoom

  const { courtRepository, bookingRepository } = useRepositories();
  const { getCourtByIdUseCase, checkAvailabilityUseCase, getWeeklyAvailabilityUseCase, createBookingUseCase } = useUseCases();

  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null); // Estado para reserva pendiente

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bookingDetailsToConfirm, setBookingDetailsToConfirm] = useState(null);
  const [paymentPercentage, setPaymentPercentage] = useState(100); // Nuevo estado para el porcentaje de pago
  
  const [timeLeft, setTimeLeft] = useState(null); // Temporizador para expiración
  const [isExpired, setIsExpired] = useState(false);

  const [weeklyAvailability, setWeeklyAvailability] = useState({});
  const [loadingWeeklyAvailability, setLoadingWeeklyAvailability] = useState(false);
  const [weeklyAvailabilityError, setWeeklyAvailabilityError] = useState(null);
  const [currentWeekStartDate, setCurrentWeekStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedSlot, setSelectedSlot] = useState(null); // Nuevo estado para la celda seleccionada

  const fetchCourtDetails = useCallback(async () => {
    if (!courtId) return;

    try {
      setLoading(true);
      setError(null);
      const courtDetails = await getCourtByIdUseCase.execute(courtId);
      setCourt(courtDetails);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
      console.error(`Error al obtener detalles de la cancha ${courtId}:`, err);
    }
  }, [courtId, getCourtByIdUseCase]);

  const fetchWeeklyAvailability = useCallback(async () => {
    setLoadingWeeklyAvailability(true);
    setWeeklyAvailabilityError(null);

    const sunday = addDays(currentWeekStartDate, 6);
    const endOfSunday = setMinutes(setHours(sunday, 23), 59);

    const formattedStartTime = currentWeekStartDate.toISOString();
    const formattedEndTime = endOfSunday.toISOString();

    try {
      const weeklyAvailabilityResults = await getWeeklyAvailabilityUseCase.execute(courtId, formattedStartTime, formattedEndTime);
      setWeeklyAvailability({ ...weeklyAvailabilityResults });
      setLoadingWeeklyAvailability(false);
    } catch (err) {
      setWeeklyAvailabilityError("Error al cargar la disponibilidad semanal.");
      setLoadingWeeklyAvailability(false);
      // console.error('Error fetching weekly availability:', err);
    }
  }, [courtId, currentWeekStartDate, getWeeklyAvailabilityUseCase]);

  useEffect(() => {
    fetchCourtDetails();
  }, [fetchCourtDetails]);

  useEffect(() => {
    if (court) {
      fetchWeeklyAvailability();
    }
  }, [court, fetchWeeklyAvailability]);

  // Manejador de clic en una celda de disponibilidad
  const handleCellClick = useCallback(async (date, hour) => {
    if (!isAuthenticated) {
      setPendingBooking({ date, hour });
      setShowLoginModal(true);
      return;
    }

    setIsBooking(true);
    setBookingError(null);
    setBookingSuccess(false);

    try {
      const [year, month, day] = date.split('-').map(Number);
      const baseDate = new Date(year, month - 1, day);

      const startDateTime = setMinutes(setHours(baseDate, hour), 0);
      const endDateTime = setMinutes(setHours(baseDate, hour + 1), 0);

      const formattedStartTime = startDateTime.toISOString();
      const formattedEndTime = endDateTime.toISOString();

      setBookingDetailsToConfirm({
        courtId,
        startDateTime,
        endDateTime,
        formattedStartTime,
        formattedEndTime,
        courtName: court?.name,
        price: court?.price,
        paymentPercentage: paymentPercentage, // Añadir el porcentaje de pago aquí
      });
      setSelectedSlot({ date, hour }); // Actualizar selectedSlot
      setShowConfirmModal(true);

    } catch (err) {
      setBookingError("Error al preparar la reserva. Inténtalo de nuevo.");
      console.error('Error preparing booking:', err.response ? err.response.data : err.message);
    } finally {
      setIsBooking(false);
      // No limpiar selectedSlot aquí, se limpiará en confirmBooking o cancelConfirmation
    }
  }, [isAuthenticated, court, courtId, paymentPercentage]);

  // Cerrar el modal de login automáticamente al autenticarse y reanudar reserva pendiente
  useEffect(() => {
    if (isAuthenticated) {
      if (showLoginModal) {
        setShowLoginModal(false);
      }
      if (pendingBooking) {
        handleCellClick(pendingBooking.date, pendingBooking.hour);
        setPendingBooking(null);
      }
    }
  }, [isAuthenticated, showLoginModal, pendingBooking, handleCellClick]);

  // WebSocket para actualizaciones de la cancha
  useEffect(() => {
    if (!courtId) return;

    courtsWebSocket.connect(courtId);

    const unsubscribe = courtsWebSocket.subscribe((data) => {
      if (data.type === 'court_updated') {
        fetchCourtDetails();
      } else if (data.type === 'court_deleted') {
        toast.info('Esta cancha ha sido eliminada');
        navigate('/courts');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [courtId, fetchCourtDetails, navigate]);

  // Actualización en tiempo real vía WebSocket para la disponibilidad
  useBookingsRealtime(useCallback((event) => {
    console.log('Real-time booking update for court detail:', event);
    // Si hay un cambio en las reservas, refrescamos la disponibilidad del calendario
    fetchWeeklyAvailability();
  }, [fetchWeeklyAvailability]));

  const closeModal = useCallback(() => {
    setSelectedImage(null);
    setCurrentImageIndex(null);
    setZoom(1);
  }, []); // Se usa useCallback para obtener una referencia estable

  // Efecto para manejar la tecla 'Escape' y cerrar el modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeModal]); // Depende de la función closeModal

  // Lógica del temporizador de 5 minutos (300 segundos)
  useEffect(() => {
    let interval = null;
    if (timeLeft !== null && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsExpired(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timeLeft]);

  const confirmBooking = async () => { 
    if (!bookingDetailsToConfirm || isExpired) return;

    setIsBooking(true);
    setBookingError(null);
    setBookingSuccess(false);
    // No cerramos el modal inmediatamente para mostrar el proceso si es necesario
    // setShowConfirmModal(false); 

    try {
      // Paso 1: Crear la reserva
      const createdBooking = await createBookingUseCase.execute({
        courtId: bookingDetailsToConfirm.courtId,
        startDateTime: bookingDetailsToConfirm.formattedStartTime,
        endDateTime: bookingDetailsToConfirm.formattedEndTime,
        paymentPercentage: bookingDetailsToConfirm.paymentPercentage,
      });

      const bookingId = createdBooking.id;
      
      // Iniciamos contador de 5 minutos una vez creada la reserva en el servidor
      setTimeLeft(300); 

      // Paso 2: Iniciar checkout con Wompi
      const paymentRepository = new ApiPaymentRepository();
      const checkoutResponse = await paymentRepository.createWompiCheckout(bookingId);

      // Paso 3: Redirigir al usuario a la página de pago de Wompi
      if (checkoutResponse.payment_url) {
        window.location.href = checkoutResponse.payment_url;
      } else {
        throw new Error('No se pudo obtener la URL de pago');
      }
    } catch (err) {
      setShowConfirmModal(false); // Si hay error, cerramos el modal
      if ((err.response && err.response.status === 401) || err.message === "No se pudo crear la reserva.") {
        setBookingError(null);
        setShowLoginModal(true);
      } else if (err.message && err.message.includes('Wompi')) {
        setBookingError(err.message);
      } else {
        setBookingError("Error al procesar el pago. Inténtalo de nuevo.");
      }
    } finally {
      setIsBooking(false);
      setBookingDetailsToConfirm(null);
      setSelectedSlot(null);
      setPaymentPercentage(100);
    }
  };

  const cancelConfirmation = () => {
    setShowConfirmModal(false);
    setBookingDetailsToConfirm(null);
    setIsBooking(false);
    setSelectedSlot(null); // Limpiar selectedSlot al cancelar
    setPaymentPercentage(100); // Resetear el porcentaje de pago
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
    setPendingBooking(null); // Limpiar reserva pendiente al cerrar el modal
    // navigate('/'); // 🚀 Permitir que el usuario se quede en la página aunque no inicie sesión
  };

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const hoursOfDay = Array.from({ length: 18 }, (_, i) => {
    const startHour24 = i + 6;
    const endHour24 = startHour24 + 1;
    const tempStartDate = setMinutes(setHours(new Date(), startHour24), 0);
    const tempEndDate = setMinutes(setHours(new Date(), endHour24), 0);
    return `${format(tempStartDate, 'h:mm a')} - ${format(tempEndDate, 'h:mm a')}`;
  });

  const handlePreviousWeek = () => {
    setCurrentWeekStartDate(addDays(currentWeekStartDate, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStartDate(addDays(currentWeekStartDate, 7));
  };

  const openModal = (imageIdentifier) => {
    if (court && court.images && court.images.length > 0) {
      let index = -1;
      // Comprueba si el identificador es un número (índice) o un string (URL)
      if (typeof imageIdentifier === 'number') {
        index = imageIdentifier;
      } else if (typeof imageIdentifier === 'string') {
        index = court.images.findIndex(img => (img.image_url || img.image) === imageIdentifier);
      }
      
      if (index !== -1 && index < court.images.length) {
        setCurrentImageIndex(index);
        setSelectedImage(court.images[index].image_url || court.images[index].image);
        setZoom(1); // Reiniciar zoom al abrir
      }
    }
  };

  const handlePreviousImage = () => {
    if (court && court.images && currentImageIndex !== null) {
      const newIndex = (currentImageIndex - 1 + court.images.length) % court.images.length;
      setCurrentImageIndex(newIndex);
      setSelectedImage(court.images[newIndex].image_url || court.images[newIndex].image);
      setZoom(1); // Reiniciar zoom al cambiar de imagen
    }
  };

  const handleNextImage = () => {
    if (court && court.images && currentImageIndex !== null) {
      const newIndex = (currentImageIndex + 1) % court.images.length;
      setCurrentImageIndex(newIndex);
      setSelectedImage(court.images[newIndex].image_url || court.images[newIndex].image);
      setZoom(1); // Reiniciar zoom al cambiar de imagen
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 1));
  };

  return {
    court,
    loading,
    error,
    selectedImage,
    isBooking,
    bookingError,
    bookingSuccess,
    showLoginModal,
    showConfirmModal,
    bookingDetailsToConfirm,
    weeklyAvailability,
    loadingWeeklyAvailability,
    weeklyAvailabilityError,
    currentWeekStartDate,
    daysOfWeek,
    hoursOfDay,
    fetchCourtDetails,
    handleCellClick,
    confirmBooking,
    cancelConfirmation,
    handleCloseLoginModal,
    handlePreviousWeek,
    handleNextWeek,
    currentImageIndex,
    selectedImage,
    openModal,
    closeModal,
    handlePreviousImage,
    handleNextImage,
    selectedSlot, // Retornar selectedSlot
    paymentPercentage, // Retornar paymentPercentage
    setPaymentPercentage, // Retornar setPaymentPercentage
    zoom, // Retornar estado de zoom
    handleZoomIn, // Retornar función de zoom in
    handleZoomOut, // Retornar función de zoom out
    timeLeft, // Retornar tiempo restante
    isExpired, // Retornar si expiró
  };
};
