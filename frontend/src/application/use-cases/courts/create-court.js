import { ICourtRepository } from '../../../domain/repositories/court-repository'; // Importar la interfaz del repositorio
import { Court } from '../../../domain/entities/court'; // Importar la entidad Court

/**
 * Caso de uso para crear una nueva cancha.
 * Esta clase reside en la capa de Aplicación y orquesta el proceso de creación de cancha
 * utilizando la interfaz del repositorio de Dominio.
 */
export class CreateCourtUseCase {
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
   * Ejecuta el caso de uso para crear una cancha.
   * @param {object} courtData - Los datos para crear la cancha.
   * @param {string} courtData.name - El nombre de la cancha.
   * @param {number} courtData.price - El precio por hora.
   * @param {string} [courtData.description] - La descripción.
   * @param {string} [courtData.characteristics] - Las características.
   * @param {File[]} [courtData.images] - Los archivos de imagen.
   * @returns {Promise<Court>} Una promesa que resuelve con la entidad Court creada.
   */
  async execute(courtData) {
    // Aquí se podría añadir lógica de aplicación adicional si fuera necesario
    // (ej. validaciones, notificaciones, etc.) antes o después de llamar al repositorio.
    return this.courtRepository.createCourt(courtData);
  }
}
