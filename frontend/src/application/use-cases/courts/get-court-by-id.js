import { ICourtRepository } from '../../../domain/repositories/court-repository'; // Importar la interfaz del repositorio
import { Court } from '../../../domain/entities/court'; // Importar la entidad Court

/**
 * Caso de uso para obtener los detalles de una cancha específica por su ID.
 * Esta clase reside en la capa de Aplicación y orquesta la obtención de datos
 * utilizando la interfaz del repositorio de Dominio.
 */
export class GetCourtByIdUseCase {
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
   * Ejecuta el caso de uso para obtener los detalles de una cancha.
   * @param {number} courtId - El ID de la cancha.
   * @returns {Promise<Court>} Una promesa que resuelve con la entidad Court.
   */
  async execute(courtId) {
    return this.courtRepository.getCourtById(courtId);
  }
}
