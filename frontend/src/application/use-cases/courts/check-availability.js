import { ICourtRepository } from '../../../domain/repositories/court-repository'; // Importar la interfaz del repositorio

/**
 * Caso de uso para verificar la disponibilidad de canchas.
 * Esta clase reside en la capa de Aplicación y orquesta la verificación de disponibilidad
 * utilizando la interfaz del repositorio de Dominio.
 */
export class CheckAvailabilityUseCase {
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
   * Ejecuta el caso de uso para verificar la disponibilidad.
   * @param {string} startTime - La fecha y hora de inicio (ISO 8601).
   * @param {string} endTime - La fecha y hora de fin (ISO 8601).
   * @returns {Promise<object[]>} Una promesa que resuelve con un array de objetos indicando la disponibilidad de cada cancha.
   */
  async execute(startTime, endTime) {
    // Aquí se podría añadir lógica de aplicación adicional si fuera necesario
    // (ej. validaciones de fechas, etc.) antes o después de llamar al repositorio.
    return this.courtRepository.checkAvailability(startTime, endTime);
  }
}
