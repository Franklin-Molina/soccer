/**
 * Interfaz que define el contrato para un repositorio de canchas.
 * Cualquier implementación de este repositorio debe adherirse a esta interfaz.
 * Esta interfaz reside en la capa de Dominio y no debe depender de capas externas.
 */
export class ICourtRepository {
  /**
   * Obtiene una lista de todas las canchas.
   * @returns {Promise<Court[]>} Una promesa que resuelve con un array de entidades Court.
   */
  async getCourts() {
    throw new Error('Method not implemented.');
  }

  /**
   * Obtiene los detalles de una cancha específica por su ID.
   * @param {number} courtId - El ID de la cancha.
   * @returns {Promise<Court>} Una promesa que resuelve con la entidad Court.
   */
  async getCourtById(courtId) {
    throw new Error('Method not implemented.');
  }

  /**
   * Crea una nueva cancha.
   * @param {object} courtData - Los datos para crear la cancha (sin ID).
   * @param {string} courtData.name - El nombre de la cancha.
   * @param {number} courtData.price - El precio por hora.
   * @param {string} [courtData.description] - La descripción.
   * @param {string} [courtData.characteristics] - Las características.
   * @param {File[]} [courtData.images] - Los archivos de imagen.
   * @returns {Promise<Court>} Una promesa que resuelve con la entidad Court creada.
   */
  async createCourt(courtData) {
    throw new Error('Method not implemented.');
  }

  /**
   * Verifica la disponibilidad de canchas para un rango de tiempo específico.
   * @param {string} startTime - La fecha y hora de inicio (ISO 8601).
   * @param {string} endTime - La fecha y hora de fin (ISO 8601).
   * @returns {Promise<object[]>} Una promesa que resuelve con un array de objetos indicando la disponibilidad de cada cancha.
   *                               Ejemplo: [{ id: 1, name: 'Cancha 1', is_available: true }, ...]
   */
  async checkAvailability(startTime, endTime) {
    throw new Error('Method not implemented.');
  }

  /**
   * Obtiene la disponibilidad semanal para una cancha específica.
   * @param {number} courtId - El ID de la cancha.
   * @returns {Promise<object>} Una promesa que resuelve con un objeto que representa la disponibilidad semanal.
   *                            Ejemplo: { '2023-10-30': { 9: true, 10: false, ... }, ... }
   */
  async getWeeklyAvailability(courtId) {
    throw new Error('Method not implemented.');
  }

  // TODO: Añadir otros métodos relacionados con canchas si son necesarios (ej. updateCourt, deleteCourt)
}
