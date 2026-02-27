import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../../../infrastructure/api/api';
import { toast } from 'react-toastify';
import CustomSelect from '../common/CustomSelect';
import WeeklyAvailabilityCalendar from '../../pages/courts/WeeklyAvailabilityCalendar';
import { format, addDays, startOfWeek, setHours, setMinutes, parseISO, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBookingsRealtime } from '../../hooks/bookings/useBookingsRealtime';
import { formatPrice } from '../../utils/formatters';

const CreateMatchForm = ({ onClose, onMatchCreated, match }) => {
  const isEditing = !!match;
  const [formData, setFormData] = useState({
    court_id: '',
    category_id: '',
    start_time: '',
    end_time: '',
    players_needed: 1,
    should_reserve: false,
  });
  const [courts, setCourts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCourtId, setSelectedCourtId] = useState(null);
  const [weeklyAvailability, setWeeklyAvailability] = useState({});
  const [loadingWeeklyAvailability, setLoadingWeeklyAvailability] = useState(false);
  const [weeklyAvailabilityError, setWeeklyAvailabilityError] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null); // { date: 'YYYY-MM-DD', hour: number }
  const [showCalendar, setShowCalendar] = useState(false); // Controla la visibilidad del calendario
  const [showConfirmBooking, setShowConfirmBooking] = useState(false);
  const [paymentPercentage, setPaymentPercentage] = useState(100);
  const [isBooking, setIsBooking] = useState(false);
  const [currentWeekStartDate, setCurrentWeekStartDate] = useState(startOfWeek(new Date(), { locale: es, weekStartsOn: 1 }));

  const handlePreviousWeek = () => setCurrentWeekStartDate(prev => subDays(prev, 7));
  const handleNextWeek = () => setCurrentWeekStartDate(prev => addDays(prev, 7));

  const daysOfWeek = useMemo(() => ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'], []);
  const hoursOfDay = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => {
      const startHour24 = i + 6;
      const endHour24 = startHour24 + 1;
      const tempStartDate = setMinutes(setHours(new Date(), startHour24), 0);
      const tempEndDate = setMinutes(setHours(new Date(), endHour24), 0);
      return `${format(tempStartDate, 'h:mm a')} - ${format(tempEndDate, 'h:mm a')}`;
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courtsRes = await api.get('/api/courts/');
        const categoriesRes = await api.get('/api/matches/open-matches/categories/');
        setCourts(courtsRes.data || []);
        setCategories(categoriesRes.data || []);
      } catch (error) {
        toast.error("No se pudieron cargar los datos para el formulario.");
      }
    };
    fetchData();

    if (isEditing && match) {
      const formatDateTimeLocal = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
        return adjustedDate.toISOString().slice(0, 16);
      };

      setFormData({
        court_id: match.court_id_read,
        category_id: match.category_id_read,
        start_time: formatDateTimeLocal(match.start_time),
        end_time: formatDateTimeLocal(match.end_time),
        players_needed: match.players_needed,
      });
      setSelectedCourtId(match.court_id_read);
      // Si estamos editando, también necesitamos establecer el slot seleccionado si hay una hora de inicio
      if (match.start_time) {
        const startDate = parseISO(match.start_time);
        setSelectedSlot({
          date: format(startDate, 'yyyy-MM-dd'),
          hour: startDate.getHours(),
        });
      }
    }
  }, [isEditing, match]);

  const fetchWeeklyAvailability = useCallback(async () => {
    if (!selectedCourtId) {
      setWeeklyAvailability({});
      return;
    }

    setLoadingWeeklyAvailability(true);
    setWeeklyAvailabilityError(null);

    const sunday = addDays(currentWeekStartDate, 6);
    const endOfSunday = setMinutes(setHours(sunday, 23), 59);

    const formattedStartTime = currentWeekStartDate.toISOString();
    const formattedEndTime = endOfSunday.toISOString();

    try {
      const response = await api.get(`/api/courts/${selectedCourtId}/weekly-availability/`, {
        params: {
          start_date: formattedStartTime,
          end_date: formattedEndTime,
        },
      });
      setWeeklyAvailability(response.data);
    } catch (error) {
      toast.error("No se pudo cargar la disponibilidad semanal de la cancha.");
      setWeeklyAvailabilityError("No se pudo cargar la disponibilidad semanal de la cancha.");
      setWeeklyAvailability({});
    } finally {
      setLoadingWeeklyAvailability(false);
    }
  }, [selectedCourtId, currentWeekStartDate]);

  useEffect(() => {
    fetchWeeklyAvailability();
  }, [fetchWeeklyAvailability]);

  // Actualización en tiempo real vía WebSocket para la disponibilidad
  useBookingsRealtime(useCallback((event) => {
    // console.log('Real-time booking update for match form:', event);
    fetchWeeklyAvailability();
  }, [fetchWeeklyAvailability]));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'court_id') {
      setSelectedCourtId(value);
      setSelectedSlot(null); // Reset selected slot when court changes
      setFormData(prev => ({ ...prev, start_time: '', end_time: '' })); // Clear times
      setShowCalendar(true); // Mostrar calendario cuando se selecciona una cancha
    }
  };

  const handleTimeSlotClick = (date, hour) => {
    const newSelectedSlot = { date, hour };
    setSelectedSlot(newSelectedSlot);

    // Separar la fecha para crear una instancia de Date local robusta
    const [year, month, day] = date.split('-').map(Number);
    const baseDate = new Date(year, month - 1, day);

    // Construir las fechas y horas de inicio y fin en tiempo local
    let startTime = setMinutes(setHours(baseDate, hour), 0);
    let endTime = setMinutes(setHours(baseDate, hour + 1), 0);

    setFormData(prev => ({
      ...prev,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
    }));
    setShowCalendar(false); // Ocultar calendario después de seleccionar una hora
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Siempre mostramos el modal de confirmación de reserva al crear un nuevo partido
    if (!isEditing) {
      setShowConfirmBooking(true);
      return;
    }

    await saveMatch();
  };

  const saveMatch = async () => {
    try {
      const apiCall = isEditing
        ? api.put(`/api/matches/open-matches/${match.id}/`, formData)
        : api.post('/api/matches/open-matches/', formData);

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

  const confirmBookingAndMatch = async () => {
    setIsBooking(true);
    try {
      // 1. Realizar la reserva
      const bookingData = {
        court: formData.court_id,
        start_time: formData.start_time,
        end_time: formData.end_time,
        payment_percentage: paymentPercentage,
        status: 'confirmed' // Lo marcamos como confirmado
      };
      
     // console.log("Intentando crear reserva con datos:", bookingData);
      
      // Corregir endpoint de reserva (de acuerdo a ApiBookingRepository)
      const bookingResponse = await api.post('/api/bookings/bookings/', bookingData);
      // console.log("Respuesta de reserva:", bookingResponse.data);
      
      toast.info("Cancha reservada con éxito.");

      // 2. Crear el partido
      await saveMatch();
    } catch (bookingError) {
      console.error("Error creating booking:", bookingError);
      const errorMsg = bookingError.response?.data?.detail || 
                       (bookingError.response?.data?.non_field_errors && bookingError.response?.data?.non_field_errors[0]) ||
                       "La cancha no está disponible para este horario.";
      toast.error(`Error en la reserva: ${errorMsg}`);
    } finally {
      setIsBooking(false);
      setShowConfirmBooking(false);
    }
  };

  const selectedCourt = useMemo(() => courts.find(c => c.id === formData.court_id), [courts, formData.court_id]);
  const priceToPay = useMemo(() => {
    if (!selectedCourt) return 0;
    return (selectedCourt.price * paymentPercentage) / 100;
  }, [selectedCourt, paymentPercentage]);

  return (
    <>
      {/* Modal Principal del Formulario */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {isEditing ? 'Editar Partido' : 'Crear Nuevo Partido'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Cancha */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Cancha
              </label>
              <CustomSelect
                options={courts.map(c => ({ value: c.id, label: c.name }))}
                value={formData.court_id}
                onChange={(value) => handleSelectChange('court_id', value)}
                placeholder="Selecciona una cancha"
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Categoría
              </label>
              <CustomSelect
                options={categories.map(c => ({ value: c.id, label: c.name }))}
                value={formData.category_id}
                onChange={(value) => handleSelectChange('category_id', value)}
                placeholder="Selecciona una categoría"
              />
            </div>

            {/* Selección de Hora */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-300 mb-3">
                Selecciona Fecha y Hora
              </h3>
              
              {selectedCourtId && selectedSlot && (
                <div className="bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500 text-emerald-800 dark:text-emerald-400 px-4 py-3 rounded-lg flex justify-between items-center">
                  <span className="text-sm">
                    <strong>{format(parseISO(selectedSlot.date), 'dd/MM/yyyy', { locale: es })}</strong> a las <strong>{hoursOfDay[selectedSlot.hour - 6]}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCalendar(true)}
                    className="ml-4 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium transition"
                  >
                    Cambiar
                  </button>
                </div>
              )}

              {selectedCourtId && !selectedSlot && (
                <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 px-4 py-3 rounded-lg text-center">
                  <p className="text-sm mb-2">Por favor, selecciona una fecha y hora</p>
                  <button
                    type="button"
                    onClick={() => setShowCalendar(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                  >
                    Abrir Calendario
                  </button>
                </div>
              )}
            </div>

            {/* Jugadores */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Jugadores Necesarios (además de ti)
              </label>
              <input
                type="number"
                name="players_needed"
                min="1"
                value={formData.players_needed}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>


            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-slate-100 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!formData.court_id || !formData.category_id || !formData.start_time || !formData.end_time}
                className={`px-5 py-2 rounded-lg text-white font-semibold transition ${
                  !formData.court_id || !formData.category_id || !formData.start_time || !formData.end_time
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                }`}
              >
                {isEditing ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de confirmación de reserva (Estilo CourtDetailPage) */}
      {showConfirmBooking && selectedCourt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">
                Confirmar Reserva y Partido
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Se realizará la reserva de la cancha y se creará tu partido simultáneamente.
              </p>
              <div className="bg-gray-100 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Cancha:</span>
                  <span className="font-semibold text-gray-800 dark:text-slate-100">{selectedCourt.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Fecha:</span>
                  <span className="font-semibold text-gray-800 dark:text-slate-100">
                    {format(parseISO(formData.start_time), 'dd/MM/yyyy', { locale: es })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Hora:</span>
                  <span className="font-semibold text-gray-800 dark:text-slate-100">
                    {format(parseISO(formData.start_time), 'h:mm a')} - {format(parseISO(formData.end_time), 'h:mm a')}
                  </span>
                </div>
              </div>

              <div className="bg-gray-100 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-300 text-sm">Precio por hora:</span>
                  <span className="font-semibold text-gray-800 dark:text-slate-100">${formatPrice(selectedCourt.price)}</span>
                </div>
                <div className="mt-4">
                  <label className="block text-slate-600 dark:text-slate-300 text-xs font-bold mb-2 uppercase tracking-wider">
                    Porcentaje a pagar ahora:
                  </label>
                  <div className="flex justify-between gap-2 mt-2">
                    {[100, 50, 10].map((pct) => (
                      <label key={pct} className={`flex-1 flex items-center justify-center p-2 rounded-lg border cursor-pointer transition-all ${
                        paymentPercentage === pct 
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' 
                        : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-emerald-400'
                      }`}>
                        <input
                          type="radio"
                          className="hidden"
                          name="paymentOption"
                          value={pct}
                          checked={paymentPercentage === pct}
                          onChange={() => setPaymentPercentage(pct)}
                        />
                        <span className="text-sm font-bold">{pct}%</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-300 dark:border-slate-600">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Total a Pagar:</span>
                  <span className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">
                    ${formatPrice(priceToPay)}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmBooking(false)}
                className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-gray-800 dark:text-white px-4 py-3 rounded-xl transition-colors font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmBookingAndMatch}
                disabled={isBooking}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-3 rounded-xl transition-all shadow-lg disabled:opacity-50 font-semibold"
              >
                {isBooking ? "Procesando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Separado para el Calendario - Más Amplio */}
      {showCalendar && selectedCourtId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl border border-gray-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            {/* Header del Modal del Calendario */}
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 bg-white dark:bg-slate-900 z-10">
              <div className="flex justify-between items-center w-full sm:w-auto">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Selecciona Fecha y Hora
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 mt-1">
                    Elige un horario disponible para tu partido
                  </p>
                </div>
                <button
                  onClick={() => setShowCalendar(false)}
                  className="sm:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  <X className="w-6 h-6 text-gray-500 dark:text-slate-400" />
                </button>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={handlePreviousWeek} 
                    className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all active:scale-95"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    type="button"
                    onClick={handleNextWeek} 
                    className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all active:scale-95"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-right hidden xs:block">
                  <p className="text-sm font-bold text-slate-800 dark:text-white capitalize">
                    {format(currentWeekStartDate, 'MMMM yyyy', { locale: es })}
                  </p>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {format(currentWeekStartDate, 'dd MMM')} - {format(addDays(currentWeekStartDate, 6), 'dd MMM')}
                  </p>
                </div>
                <button
                  onClick={() => setShowCalendar(false)}
                  className="hidden sm:block p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  <X className="w-6 h-6 text-gray-500 dark:text-slate-400" />
                </button>
              </div>
            </div>

            {/* Contenido del Calendario */}
            <div className="p-4 sm:p-6">
              <div className="xs:hidden text-center mb-4 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-sm font-bold text-slate-800 dark:text-white capitalize">
                  {format(currentWeekStartDate, 'MMMM yyyy', { locale: es })}
                </p>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {format(currentWeekStartDate, 'dd MMM')} - {format(addDays(currentWeekStartDate, 6), 'dd MMM')}
                </p>
              </div>
              <WeeklyAvailabilityCalendar
                weeklyAvailability={weeklyAvailability}
                loadingWeeklyAvailability={loadingWeeklyAvailability}
                weeklyAvailabilityError={weeklyAvailabilityError}
                onTimeSlotClick={handleTimeSlotClick}
                daysOfWeek={daysOfWeek}
                hoursOfDay={hoursOfDay}
                monday={currentWeekStartDate}
                selectedSlot={selectedSlot}
              />
            </div>

            {/* Footer del Modal del Calendario */}
            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center sticky bottom-0 bg-white dark:bg-slate-900">
              <div className="flex gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-teal-400/50 dark:bg-teal-500/20 border-2 border-teal-500/70 dark:border-teal-500/30"></div>
                  <span className="text-gray-600 dark:text-slate-400">Disponible</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-red-400/40 dark:bg-red-500/20 border-2 border-red-500/70 dark:border-red-500/40"></div>
                  <span className="text-gray-600 dark:text-slate-400">Ocupado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-slate-200/60 dark:bg-gray-500/10 border-2 border-slate-300/70 dark:border-gray-600/20 opacity-50"></div>
                  <span className="text-gray-600 dark:text-slate-400">Expirado</span>
                </div>
              </div>
              <button
                onClick={() => setShowCalendar(false)}
                className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-slate-100 transition font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateMatchForm;