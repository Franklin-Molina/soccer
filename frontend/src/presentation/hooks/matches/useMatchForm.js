import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useBookingsRealtime } from '../bookings/useBookingsRealtime';
import { MatchService } from '../../../infrastructure/services/matchService';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { MatchesApi } from '../../../infrastructure/api/matches-api';

/**
 * Hook personalizado para manejar la lógica del formulario de creación/edición de partidos
 * @param {Object} params - Parámetros
 * @param {Object} params.match - Partido existente (para edición)
 * @param {Function} params.onClose - Función para cerrar el formulario
 * @param {Function} params.onMatchCreated - Función callback al crear/actualizar partido
 * @returns {Object} Objeto con estado y funciones para el formulario
 */
export const useMatchForm = ({ match, onClose, onMatchCreated }) => {
  const isEditing = !!match;
  const [formData, setFormData] = useState({
    court_id: '',
    category_id: '',
    start_time: '',
    end_time: '',
    players_needed: 1,
    should_reserve: false,
  });
  const queryClient = useQueryClient();
  const [selectedCourtId, setSelectedCourtId] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showConfirmBooking, setShowConfirmBooking] = useState(false);
  const [paymentPercentage, setPaymentPercentage] = useState(100);
  const [isBooking, setIsBooking] = useState(false);
  const [currentWeekStartDate, setCurrentWeekStartDate] = useState(
    MatchService.navigateWeek(new Date(), -new Date().getDay() + 1)
  );

  // Datos estáticos
  const daysOfWeek = useMemo(() => MatchService.getDaysOfWeek(), []);
  const hoursOfDay = useMemo(() => MatchService.getHoursOfDay(), []);

  // Cargar datos iniciales con caché
  const { data: initialData } = useQuery({
    queryKey: ['matchInitialData'],
    queryFn: MatchService.getInitialFormData,
    staleTime: 10 * 60 * 1000,
  });

  const courts = useMemo(() => initialData?.courts || [], [initialData]);
  const categories = useMemo(() => initialData?.categories || [], [initialData]);

  // Inicializar formulario para edición
  useEffect(() => {
    if (isEditing && match) {
      const initializeEditForm = async () => {
        setFormData({
          court_id: match.court_id_read,
          category_id: match.category_id_read,
          start_time: MatchService.formatDateTimeLocal(match.start_time),
          end_time: MatchService.formatDateTimeLocal(match.end_time),
          players_needed: match.players_needed,
        });
        setSelectedCourtId(match.court_id_read);

        if (match.start_time) {
          const startDate = parseISO(match.start_time);
          setSelectedSlot({
            date: format(startDate, 'yyyy-MM-dd'),
            hour: startDate.getHours(),
          });
        }
      };
      initializeEditForm();
    }
  }, [isEditing, match]);

  // Obtener disponibilidad semanal con caché
  const { 
    data: weeklyAvailability = {}, 
    isLoading: loadingWeeklyAvailability, 
    error: weeklyAvailabilityError 
  } = useQuery({
    queryKey: ['weeklyAvailability', selectedCourtId, currentWeekStartDate],
    queryFn: () => MatchService.getWeeklyAvailability(selectedCourtId, currentWeekStartDate),
    enabled: !!selectedCourtId,
  });

  // Actualización en tiempo real
  useBookingsRealtime(useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['weeklyAvailability'] });
  }, [queryClient]));

  // Manejo de cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'court_id') {
      setSelectedCourtId(value);
      setSelectedSlot(null);
      setFormData(prev => ({ ...prev, start_time: '', end_time: '' }));
      setShowCalendar(true);
    }
  };

  // Manejo de selección de slot de tiempo
  const handleTimeSlotClick = (date, hour) => {
    const newSelectedSlot = { date, hour };
    setSelectedSlot(newSelectedSlot);

    const timeData = MatchService.createTimeSlotData(date, hour);
    setFormData(prev => ({
      ...prev,
      start_time: timeData.start_time,
      end_time: timeData.end_time,
    }));
    setShowCalendar(false);
  };

  // Navegación entre semanas
  const handlePreviousWeek = () => {
    setCurrentWeekStartDate(prev => MatchService.navigateWeek(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStartDate(prev => MatchService.navigateWeek(prev, 7));
  };

  // Guardar partido
  const saveMatch = async () => {
    try {
      const apiCall = isEditing
        ? MatchesApi.updateMatch(match.id, formData)
        : MatchesApi.createMatch(formData);

      await apiCall;
      toast.success(isEditing ? "¡Partido actualizado!" : "¡Partido creado con éxito!");
      onMatchCreated();
      onClose();
    } catch (error) {
      console.error(isEditing ? "Error updating match:" : "Error creating match:", error);
      toast.error(
        error.response?.data?.detail ||
        (isEditing ? "No se pudo actualizar el partido." : "No se pudo crear el partido.")
      );
    }
  };

  // Confirmar reserva y partido (FLUJO ATÓMICO CON PAGO)
  const confirmBookingAndMatch = async () => {
    setIsBooking(true);
    try {
      const matchData = {
        court_id: formData.court_id,
        category_id: formData.category_id,
        start_time: formData.start_time,
        end_time: formData.end_time,
        players_needed: formData.players_needed,
        payment_percentage: paymentPercentage,
      };

      const response = await MatchesApi.createMatchWithPayment(matchData);
      
      if (response.data.payment_url) {
        toast.info("Redirigiendo a la pasarela de pagos...");
        // Pequeño delay para que el usuario lea el mensaje
        setTimeout(() => {
          window.location.href = response.data.payment_url;
        }, 1500);
      } else {
        toast.success("¡Partido creado con éxito!");
        onMatchCreated();
        onClose();
      }
    } catch (error) {
      console.error("Error creating match with payment:", error);
      const errorMsg = error.response?.data?.error || 
                      error.response?.data?.detail ||
                      "Error al procesar el partido y la reserva. Inténtalo de nuevo.";
      toast.error(errorMsg);
      setIsBooking(false);
    }
  };

  // Manejo del submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEditing) {
      setShowConfirmBooking(true);
      return;
    }

    await saveMatch();
  };

  // Datos derivados
  const selectedCourt = useMemo(() => courts.find(c => c.id === formData.court_id), [courts, formData.court_id]);
  const priceToPay = useMemo(() => {
    if (!selectedCourt) return 0;
    
    // Calcular duración en horas
    if (!formData.start_time || !formData.end_time) return 0;
    const start = parseISO(formData.start_time);
    const end = parseISO(formData.end_time);
    const durationHours = (end - start) / (1000 * 60 * 60);
    
    const total = selectedCourt.price * durationHours;
    return (total * paymentPercentage) / 100;
  }, [selectedCourt, paymentPercentage, formData.start_time, formData.end_time]);

  return {
    formData,
    courts,
    categories,
    selectedCourtId,
    weeklyAvailability,
    loadingWeeklyAvailability,
    weeklyAvailabilityError,
    selectedSlot,
    showCalendar,
    showConfirmBooking,
    paymentPercentage,
    isBooking,
    currentWeekStartDate,
    daysOfWeek,
    hoursOfDay,
    isEditing,
    selectedCourt,
    priceToPay,
    handleChange,
    handleSelectChange,
    handleTimeSlotClick,
    handlePreviousWeek,
    handleNextWeek,
    handleSubmit,
    confirmBookingAndMatch,
    setShowCalendar,
    setShowConfirmBooking,
    setPaymentPercentage,
  };
};
