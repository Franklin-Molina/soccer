import { Booking } from '../entities/booking'; // Importar la entidad Booking

/**
 * Interfaz que define el contrato para un repositorio de reservas.
 * Cualquier implementación de este repositorio debe adherirse a esta interfaz.
 * Esta interfaz reside en la capa de Dominio y no debe depender de capas externas.
 */
export class IBookingRepository {
  /**
   * Crea una nueva reserva.
   * @param {object} bookingData - Los datos para crear la reserva.
   * @param {number} bookingData.court - El ID de la cancha.
   * @param {string} bookingData.start_time - La fecha y hora de inicio (ISO 8601).
   * @param {string} bookingData.end_time - La fecha y hora de fin (ISO 8601).
   * @returns {Promise<Booking>} Una promesa que resuelve con la entidad Booking creada.
   */
  async createBooking(bookingData) {
    throw new Error('Method not implemented.');
  }

  /**
   * Obtiene una lista de todas las reservas (posiblemente filtradas o paginadas).
   * @returns {Promise<Booking[]>} Una promesa que resuelve con un array de entidades Booking.
   */
  async getBookings() {
    throw new Error('Method not implemented.');
  }

  // TODO: Añadir otros métodos relacionados con reservas si son necesarios (ej. getBookingById, cancelBooking)
}
