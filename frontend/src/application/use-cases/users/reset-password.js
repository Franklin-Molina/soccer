/**
 * Caso de uso para solicitar el restablecimiento de contraseña.
 */
export class ResetPasswordUseCase {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  /**
   * Ejecuta el caso de uso.
   * @param {string} email - El correo electrónico del usuario.
   * @returns {Promise<any>} Promesa con la respuesta de la API.
   */
  async execute(email) {
    return await this.authRepository.resetPassword(email);
  }
}
