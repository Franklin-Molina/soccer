//import api from '../web/api.js';
import api from '../api/api.js'; // Importar la instancia de axios configurada

/**
 * Repositorio de pagos para interactuar con la API.
 */
export class ApiPaymentRepository {
  /**
   * Inicia el checkout con Wompi para una reserva.
   * @param {number} bookingId - ID de la reserva.
   * @returns {Promise<object>} Respuesta con payment_url y datos del pago.
   */
  async createWompiCheckout(bookingId) {
    try {
      const response = await api.post('/api/payments/wompi/checkout/', {
        booking_id: bookingId,
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al iniciar el pago con Wompi';
      throw new Error(errorMessage);
    }
  }

  /**
   * Obtiene la lista de pagos del usuario.
   * @returns {Promise<Array>} Lista de pagos.
   */
  async getPayments() {
    try {
      const response = await api.get('/api/payments/');
      return response.data;
    } catch (error) {
      throw new Error('Error al obtener los pagos');
    }
  }

  /**
   * Obtiene un pago específico por su ID.
   * @param {number} paymentId - ID del pago.
   * @returns {Promise<object>} Datos del pago.
   */
  async getPaymentById(paymentId) {
    try {
      const response = await api.get(`/api/payments/${paymentId}/`);
      return response.data;
    } catch (error) {
      throw new Error('Error al obtener el pago');
    }
  }
}