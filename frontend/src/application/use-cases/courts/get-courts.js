import { ICourtRepository } from '../../../domain/repositories/court-repository'; // Importar la interfaz del repositorio
import { Court } from '../../../domain/entities/court'; // Importar la entidad Court

/**
 * Caso de uso para obtener la lista de canchas.
 * Esta clase reside en la capa de Aplicación y orquesta la obtención de datos
 * utilizando la interfaz del repositorio de Dominio.
 */
export class GetCourtsUseCase {
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
   * Ejecuta el caso de uso para obtener la lista de canchas.
   * @returns {Promise<Court[]>} Una promesa que resuelve con un array de entidades Court.
   */
  /**
   * Ejecuta el caso de uso para obtener la lista de canchas.
   * @param {object} [filters={}] - Un objeto con los filtros a aplicar.
   * @returns {Promise<Court[]>} Una promesa que resuelve con un array de entidades Court.
   */
  async execute(filters = {}) {
    return this.courtRepository.getCourts(filters);
  }
}
