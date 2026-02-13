import { IAuthRepository } from '../../../domain/repositories/auth-repository'; // Importar la interfaz del repositorio
import { AuthenticatedUser } from '../../../domain/entities/auth'; // Importar la entidad AuthenticatedUser

/**
 * Caso de uso para obtener la información del usuario autenticado.
 * Esta clase reside en la capa de Aplicación y orquesta la obtención de datos del usuario
 * utilizando la interfaz del repositorio de Dominio.
 */
export class GetAuthenticatedUserUseCase {
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
   * Ejecuta el caso de uso para obtener el usuario autenticado.
   * @returns {Promise<AuthenticatedUser | null>} Una promesa que resuelve con la entidad AuthenticatedUser o null.
   */
  async execute() {
    return this.authRepository.getAuthenticatedUser();
  }
}
