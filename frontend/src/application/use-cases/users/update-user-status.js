import { IUserRepository } from '../../../domain/repositories/user-repository.js';

/**
 * Caso de uso para actualizar el estado (activo/inactivo) de un usuario en el frontend.
 */
export class UpdateUserStatusUseCase {
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
   * Ejecuta el caso de uso para actualizar el estado de un usuario.
   * @param {number} userId - El ID del usuario.
   * @param {boolean} isActive - El nuevo estado de activación.
   * @returns {Promise<object>} Una promesa que resuelve con el objeto del usuario actualizado o un mensaje de éxito.
   */
  async execute(userId, isActive) {
    return this.userRepository.updateUserStatus(userId, isActive);
  }
}
