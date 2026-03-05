import { MatchesApi } from '../api/matches-api';
import { format, addDays, setHours, setMinutes, parseISO, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Servicio de partidos - Capa de Infraestructura
 * Proporciona lógica de negocio y acceso a datos para partidos
 */
export const MatchService = {
  /**
   * Obtener datos iniciales para el formulario de partidos
   * @returns {Promise<Object>} Objeto con canchas y categorías
   */
  getInitialFormData: async () => {
    try {
      const [courtsRes, categoriesRes] = await Promise.all([
        MatchesApi.getCourts(),
        MatchesApi.getMatchCategories(),
      ]);

      return {
        courts: courtsRes.data || [],
        categories: categoriesRes.data || [],
      };
    } catch (error) {
      console.error("Error al obtener datos iniciales:", error);
      throw new Error("No se pudieron cargar los datos para el formulario.");
    }
  },

  /**
   * Obtener disponibilidad semanal de una cancha
   * @param {number} courtId - ID de la cancha
   * @param {Date} weekStartDate - Fecha de inicio de la semana
   * @returns {Promise<Object>} Disponibilidad semanal
   */
  getWeeklyAvailability: async (courtId, weekStartDate) => {
    if (!courtId) {
      return {};
    }

    const sunday = addDays(weekStartDate, 6);
    const endOfSunday = setMinutes(setHours(sunday, 23), 59);

    const formattedStartTime = weekStartDate.toISOString();
    const formattedEndTime = endOfSunday.toISOString();

    try {
      const response = await MatchesApi.getWeeklyAvailability(
        courtId,
        formattedStartTime,
        formattedEndTime
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener disponibilidad semanal:", error);
      throw new Error("No se pudo cargar la disponibilidad semanal de la cancha.");
    }
  },

  /**
   * Formatear fecha para input datetime-local
   * @param {string} isoString - Fecha en formato ISO
   * @returns {string} Fecha formateada para input
   */
  formatDateTimeLocal: (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
    return adjustedDate.toISOString().slice(0, 16);
  },

  /**
   * Crear datos de tiempo para un slot seleccionado
   * @param {string} date - Fecha en formato YYYY-MM-DD
   * @param {number} hour - Hora (0-23)
   * @returns {Object} Objeto con start_time y end_time en formato ISO
   */
  createTimeSlotData: (date, hour) => {
    const [year, month, day] = date.split('-').map(Number);
    const baseDate = new Date(year, month - 1, day);

    const startTime = setMinutes(setHours(baseDate, hour), 0);
    const endTime = setMinutes(setHours(baseDate, hour + 1), 0);

    return {
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
    };
  },

  /**
   * Obtener horas del día para el calendario
   * @returns {Array<string>} Array de rangos horarios
   */
  getHoursOfDay: () => {
    return Array.from({ length: 18 }, (_, i) => {
      const startHour24 = i + 6;
      const endHour24 = startHour24 + 1;
      const tempStartDate = setMinutes(setHours(new Date(), startHour24), 0);
      const tempEndDate = setMinutes(setHours(new Date(), endHour24), 0);
      return `${format(tempStartDate, 'h:mm a')} - ${format(tempEndDate, 'h:mm a')}`;
    });
  },

  /**
   * Obtener días de la semana
   * @returns {Array<string>} Array de días abreviados
   */
  getDaysOfWeek: () => ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],

  /**
   * Navegar entre semanas
   * @param {Date} currentDate - Fecha actual
   * @param {number} days - Días a sumar/restar
   * @returns {Date} Nueva fecha
   */
  navigateWeek: (currentDate, days) => {
    return days > 0 ? addDays(currentDate, days) : subDays(currentDate, Math.abs(days));
  },
};