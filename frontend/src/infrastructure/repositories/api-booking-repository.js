// frontend/src/infrastructure/repositories/api-booking-repository.js

import { BookingRepository } from '../../domain/repositories/booking_repository';
import api from '../api/api'; // Importar la utilidad de la API

/**
 * @class ApiBookingRepository
 * @extends BookingRepository
 * @description Implementación del repositorio de reservas que interactúa con la API del backend.
 */
export class ApiBookingRepository extends BookingRepository {
    /**
     * Crea una nueva reserva a través de la API.
     * @param {object} bookingData - Los datos de la reserva a crear.
     * @returns {Promise<object>} Los datos de la reserva creada.
     * @throws {Error} Si ocurre un error en la llamada a la API.
     */
    async createBooking(bookingData) {
        try {
            // El endpoint para crear reservas es '/api/bookings/'
            const response = await api.post('/api/bookings/bookings/', bookingData);
            return response.data;
        } catch (error) {
          //  console.error("Error en ApiBookingRepository al crear reserva:", error);
            // Propagar el error para que el caso de uso lo maneje
            throw error;
        }
    }

    /**
     * Obtiene la lista de todas las reservas a través de la API.
     * @param {number} page - El número de página a solicitar.
     * @returns {Promise<object>} Una promesa que resuelve con el objeto de respuesta paginada.
     * @throws {Error} Si ocurre un error en la llamada a la API.
     */
    async getBookings(page = 1) {
        try {
            const response = await api.get(`/api/bookings/bookings/?page=${page}`);
            return response.data;
        } catch (error) {
           // console.error("Error en ApiBookingRepository al obtener reservas:", error);
            throw error;
        }
    }

    /**
     * Elimina una reserva a través de la API.
     * @param {string} bookingId - El ID de la reserva a eliminar.
     * @returns {Promise<void>}
     * @throws {Error} Si ocurre un error en la llamada a la API.
     */
    async deleteBooking(bookingId) {
        try {
            await api.delete(`/api/bookings/bookings/${bookingId}/`);
        } catch (error) {
            console.error(`Error en ApiBookingRepository al eliminar reserva ${bookingId}:`, error);
            throw error;
        }
    }
}
