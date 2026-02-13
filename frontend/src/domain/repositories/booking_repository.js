// frontend/src/domain/repositories/booking_repository.js

/**
 * @interface BookingRepository
 * @description Interfaz para el repositorio de reservas.
 * Define los métodos que deben ser implementados por cualquier repositorio de reservas.
 */
export class BookingRepository {
    /**
     * Crea una nueva reserva.
     * @param {object} bookingData - Los datos de la reserva a crear.
     * @returns {Promise<object>} Los datos de la reserva creada.
     * @throws {Error} Si ocurre un error al crear la reserva.
     */
    async createBooking(bookingData) {
        throw new Error("El método createBooking debe ser implementado por la clase que herede de BookingRepository.");
    }

    /**
     * Obtiene la lista de todas las reservas.
     * @returns {Promise<object[]>} Una promesa que resuelve con un array de objetos de reserva.
     * @throws {Error} Si ocurre un error al obtener las reservas.
     */
    async getBookings() {
        throw new Error("El método getBookings debe ser implementado por la clase que herede de BookingRepository.");
    }

    // TODO: Añadir otros métodos relacionados con reservas si son necesarios (ej: getBookingDetails, getUserBookings, etc.)
}
