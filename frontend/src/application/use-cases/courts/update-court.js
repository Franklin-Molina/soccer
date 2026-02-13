import { ICourtRepository } from '../../../domain/repositories/court-repository'; // Importar la interfaz del repositorio

/**
 * Caso de uso para actualizar una cancha existente.
 * Esta clase reside en la capa de Aplicación y orquesta el proceso de actualización de cancha
 * utilizando la interfaz del repositorio de Dominio.
 */
export class UpdateCourtUseCase {
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
   * Ejecuta el caso de uso para actualizar una cancha.
   * @param {number} courtId - El ID de la cancha a actualizar.
   * @param {object} courtData - Los datos para actualizar la cancha.
   * @returns {Promise<object>} Una promesa que resuelve con los datos de la cancha actualizada.
   */
  async execute(courtId, courtData) {
    // Aquí se podría añadir lógica de aplicación adicional si fuera necesario
    // (ej. validaciones, notificaciones, etc.) antes o después de llamar al repositorio.
    return this.courtRepository.updateCourt(courtId, courtData);
  }
}
