/**
 * Entidad de dominio que representa una reserva.
 */
export class Booking {
  /**
   * @param {object} data - Los datos para inicializar la entidad Booking.
   * @param {number} data.id - El ID de la reserva.
   * @param {number} data.court - El ID de la cancha reservada.
   * @param {number} data.user - El ID del usuario que hizo la reserva.
   * @param {string} data.start_time - La fecha y hora de inicio (ISO 8601).
   * @param {string} data.end_time - La fecha y hora de fin (ISO 8601).
   * @param {string} data.status - El estado de la reserva (e.g., 'PENDING', 'CONFIRMED', 'CANCELLED').
   * @param {number} data.payment - El ID del pago asociado.
   */
  constructor({ id, court, user, start_time, end_time, status, payment }) {
    // Permitir que algunos campos sean null o undefined si el backend los devuelve así inicialmente
    // if (id === undefined || court === undefined || user === undefined || !start_time || !end_time || !status || payment === undefined) {
    //   throw new Error('Booking entity requires id, court, user, start_time, end_time, status, and payment.');
    // }
    this.id = id;
    this.court = court;
    this.user = user;
    this.start_time = start_time;
    this.end_time = end_time;
    this.status = status;
    this.payment = payment;
  }
}
