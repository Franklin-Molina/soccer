import { IBookingRepository } from '../../../domain/repositories/booking-repository';

/**
 * Caso de uso para eliminar una reserva.
 */
export class DeleteBookingUseCase {
  /**
   * @param {IBookingRepository} bookingRepository - Una implementación del repositorio de reservas.
   */
  constructor(bookingRepository) {
    this.bookingRepository = bookingRepository;
  }

  /**
   * Ejecuta el caso de uso para eliminar una reserva.
   * @param {string} bookingId - El ID de la reserva a eliminar.
   * @returns {Promise<void>}
   */
  async execute(bookingId) {
    return this.bookingRepository.deleteBooking(bookingId);
  }
}
