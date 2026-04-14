import api from './api';

/**
 * Abstracción de API para operaciones relacionadas con partidos
 */
export const MatchesApi = {
  /**
   * Obtener todas las canchas
   * @returns {Promise} Promesa con la respuesta de la API
   */
  getCourts: () => api.get('/api/courts/'),

  /**
   * Obtener categorías de partidos
   * @returns {Promise} Promesa con la respuesta de la API
   */
  getMatchCategories: () => api.get('/api/matches/open-matches/categories/'),

  /**
   * Obtener disponibilidad semanal de una cancha
   * @param {number} courtId - ID de la cancha
   * @param {string} startDate - Fecha de inicio en formato ISO
   * @param {string} endDate - Fecha de fin en formato ISO
   * @returns {Promise} Promesa con la respuesta de la API
   */
  getWeeklyAvailability: (courtId, startDate, endDate) => {
    return api.get(`/api/courts/${courtId}/weekly-availability/`, {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    });
  },

  /**
   * Crear un nuevo partido
   * @param {Object} matchData - Datos del partido
   * @returns {Promise} Promesa con la respuesta de la API
   */
  createMatch: (matchData) => api.post('/api/matches/open-matches/', matchData),

  /**
   * Actualizar un partido existente
   * @param {number} matchId - ID del partido
   * @param {Object} matchData - Datos actualizados del partido
   * @returns {Promise} Promesa con la respuesta de la API
   */
  updateMatch: (matchId, matchData) => api.put(`/api/matches/open-matches/${matchId}/`, matchData),

  /**
   * Crear una reserva
   * @param {Object} bookingData - Datos de la reserva
   * @returns {Promise} Promesa con la respuesta de la API
   */
  createBooking: (bookingData) => api.post('/api/bookings/bookings/', bookingData),

  /**
   * Crear un partido con pago atómico (Booking + Match + Payment)
   * @param {Object} matchData - Datos del partido y reserva
   * @returns {Promise} Promesa con la respuesta de la API (incluye checkout_url)
   */
  createMatchWithPayment: (matchData) => api.post('/api/matches/open-matches/create-with-payment/', matchData),
};
