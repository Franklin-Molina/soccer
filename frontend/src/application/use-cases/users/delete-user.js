import { IUserRepository } from '../../../domain/repositories/user-repository.js';

/**
 * Caso de uso para eliminar un usuario en el frontend.
 */
export class DeleteUserUseCase {
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
   * Ejecuta el caso de uso para eliminar un usuario.
   * @param {number} userId - El ID del usuario.
   * @returns {Promise<void>} Una promesa que resuelve cuando el usuario ha sido eliminado.
   */
  async execute(userId) {
    return this.userRepository.deleteOnlyUsers(userId);
  }
}
