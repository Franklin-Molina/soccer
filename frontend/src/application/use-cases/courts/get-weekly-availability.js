import { ICourtRepository } from '../../../domain/repositories/court-repository'; // Importar la interfaz del repositorio

/**
 * Caso de uso para obtener la disponibilidad semanal de una cancha.
 * Esta clase reside en la capa de Aplicación y orquesta la obtención de datos
 * utilizando la interfaz del repositorio de Dominio.
 */
export class GetWeeklyAvailabilityUseCase {
  /**
   * @param {ICourtRepository} courtRepository - Una implementación del repositorio de canchas.
   */
  constructor(courtRepository) {
    if (!(courtRepository instanceof ICourtRepository)) {
      throw new Error('courtRepository must be an instance of ICourtRepository');
    }
    this.courtRepository = courtRepository;
  }

  /**
   * Ejecuta el caso de uso para obtener la disponibilidad semanal.
   * @param {number} courtId - El ID de la cancha.
   * @param {string} start_date - La fecha de inicio de la semana (ISO 8601).
   * @param {string} end_date - La fecha de fin de la semana (ISO 8601).
   * @returns {Promise<object>} Una promesa que resuelve con un objeto que representa la disponibilidad semanal.
   */
  async execute(courtId, start_date, end_date) {
    // Aquí se podría añadir lógica de aplicación adicional si fuera necesario.
    return this.courtRepository.getWeeklyAvailability(courtId, start_date, end_date);
  }
}
