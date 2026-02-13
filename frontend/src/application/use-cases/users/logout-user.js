import { IAuthRepository } from '../../../domain/repositories/auth-repository'; // Importar la interfaz del repositorio

/**
 * Caso de uso para cerrar la sesión del usuario.
 * Esta clase reside en la capa de Aplicación y orquesta el proceso de logout
 * utilizando la interfaz del repositorio de Dominio.
 */
export class LogoutUserUseCase {
  /**
   * @param {IAuthRepository} authRepository - Una implementación del repositorio de autenticación.
   */
  constructor(authRepository) {
    if (!(authRepository instanceof IAuthRepository)) {
      throw new Error('authRepository must be an instance of IAuthRepository');
    }
    this.authRepository = authRepository;
  }

  /**
   * Ejecuta el caso de uso para cerrar sesión.
   * @returns {Promise<void>} Una promesa que resuelve cuando la sesión se ha cerrado.
   */
  async execute() {
    return this.authRepository.logout();
  }
}
