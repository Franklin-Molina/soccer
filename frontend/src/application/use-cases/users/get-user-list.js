import { IUserRepository } from '../../../domain/repositories/user-repository.js';

/**
 * Caso de uso para obtener la lista de usuarios en el frontend.
 */
export class GetUserListUseCase {
  /**
   * @param {IUserRepository} userRepository - Una implementación del repositorio de usuarios.
   */
  constructor(userRepository) {
    if (!(userRepository instanceof IUserRepository)) {
      throw new Error('userRepository must be an instance of IUserRepository');
    }
    this.userRepository = userRepository;
  }

  /**
   * Ejecuta el caso de uso para obtener la lista de usuarios.
   * @param {object} [filters] - Filtros opcionales (ej. { role: 'admin' }).
   * @returns {Promise<object[]>} Una promesa que resuelve con un array de objetos de usuario.
   */
  async execute(filters) {
    return this.userRepository.getAllUsers(filters);
  }
}
