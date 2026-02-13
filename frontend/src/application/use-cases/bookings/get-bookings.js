import { IBookingRepository } from '../../../domain/repositories/booking-repository'; // Importar la interfaz del repositorio
import { Booking } from '../../../domain/entities/booking'; // Importar la entidad Booking

/**
 * Caso de uso para obtener la lista de reservas.
 * Esta clase reside en la capa de Aplicación y orquesta la obtención de datos
 * utilizando la interfaz del repositorio de Dominio.
 */
export class GetBookingsUseCase {
  /**
   * @param {IBookingRepository} bookingRepository - Una implementación del repositorio de reservas.
   */
  constructor(bookingRepository) {
    this.bookingRepository = bookingRepository;
  }

  /**
   * Ejecuta el caso de uso para obtener la lista de reservas.
   * @param {number} page - El número de página a solicitar.
   * @returns {Promise<object>} Una promesa que resuelve con el objeto de respuesta paginada.
   */
  async execute(page) {
    return this.bookingRepository.getBookings(page);
  }
}
