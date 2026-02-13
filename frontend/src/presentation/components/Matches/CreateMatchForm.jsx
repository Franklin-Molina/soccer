import React, { useState, useEffect, useMemo } from 'react';
import api from '../../../infrastructure/api/api';
import { toast } from 'react-toastify';
import CustomSelect from '../common/CustomSelect';
import WeeklyAvailabilityCalendar from '../../pages/courts/WeeklyAvailabilityCalendar';
import { format, addDays, startOfWeek, setHours, setMinutes, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { X } from 'lucide-react';
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

  const daysOfWeek = useMemo(() => ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'], []);
  const hoursOfDay = useMemo(() => {
    const hours = [];
    for (let i = 6; i <= 22; i++) { // Horario de 6 AM a 10 PM
      const startHour = i;
      const endHour = i + 1;
      const formatHour = (h) => {
        const period = h < 12 ? 'AM' : 'PM';
        const hour = h % 12 === 0 ? 12 : h % 12;
        return `${hour}:00 ${period}`;
      };
      hours.push(`${formatHour(startHour)} - ${formatHour(endHour)}`);
    }
    return hours;
  }, []);

  const monday = useMemo(() => startOfWeek(new Date(), { locale: es, weekStartsOn: 1 }), []); // Lunes de la semana actual

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

  useEffect(() => {
    if (selectedCourtId) {
      const fetchWeeklyAvailability = async () => {
        setLoadingWeeklyAvailability(true);
        setWeeklyAvailabilityError(null);
        try {
          const sunday = addDays(monday, 6); // Calcular el domingo
          const response = await api.get(`/api/courts/${selectedCourtId}/weekly-availability/`, {
            params: {
              start_date: format(monday, 'yyyy-MM-dd'),
              end_date: format(sunday, 'yyyy-MM-dd'),
            },
          });
          setWeeklyAvailability(response.data);
        } catch (error) {
       //   console.error("Error fetching weekly availability:", error);
          toast.error("No se pudo cargar la disponibilidad semanal de la cancha.");
          setWeeklyAvailabilityError("No se pudo cargar la disponibilidad semanal de la cancha.");
          setWeeklyAvailability({});
        } finally {
          setLoadingWeeklyAvailability(false);
        }
      };
      fetchWeeklyAvailability();
    } else {
      setWeeklyAvailability({});
      setWeeklyAvailabilityError(null);
    }
  }, [selectedCourtId, monday]); // Añadir monday como dependencia

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

    //console.log("Slot seleccionado:", newSelectedSlot);
    //console.log("Índice para hoursOfDay:", hour - 6);
    //console.log("Valor de hoursOfDay en el índice:", hoursOfDay[hour - 6]);

    // Construir las fechas y horas de inicio y fin
    let startTime = setHours(parseISO(date), hour);
    startTime = setMinutes(startTime, 0);
    let endTime = addDays(startTime, 0); // Mismo día
    endTime = setHours(endTime, hour + 1); // Una hora después
    endTime = setMinutes(endTime, 0);

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
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Selecciona Fecha y Hora
                </h2>
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                  Elige un horario disponible para tu partidos
                </p>
              </div>
              
              <button
                onClick={() => setShowCalendar(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-slate-400" />
              </button>
            </div>

            {/* Contenido del Calendario */}
            <div className="p-6">
              <WeeklyAvailabilityCalendar
                weeklyAvailability={weeklyAvailability}
                loadingWeeklyAvailability={loadingWeeklyAvailability}
                weeklyAvailabilityError={weeklyAvailabilityError}
                onTimeSlotClick={handleTimeSlotClick}
                daysOfWeek={daysOfWeek}
                hoursOfDay={hoursOfDay}
                monday={monday}
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