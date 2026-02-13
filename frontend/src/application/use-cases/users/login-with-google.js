import { IAuthRepository } from '../../../domain/repositories/auth-repository'; // Importar la interfaz del repositorio
import { AuthTokens } from '../../../domain/entities/auth'; // Importar la entidad AuthTokens

/**
 * Caso de uso para iniciar sesión con Google.
 * Esta clase reside en la capa de Aplicación y orquesta el proceso de login con Google
 * utilizando la interfaz del repositorio de Dominio.
 */
export class LoginWithGoogleUseCase {
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
   * Ejecuta el caso de uso para iniciar sesión con Google.
   * @param {string} googleAccessToken - El token de acceso de Google.
   * @returns {Promise<AuthTokens>} Una promesa que resuelve con los tokens de autenticación.
   */
  async execute(googleAccessToken) {
    return this.authRepository.loginWithGoogle(googleAccessToken);
  }
}
