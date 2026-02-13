/**
 * Caso de uso para confirmar el restablecimiento de contraseña.
 */
export class ResetPasswordConfirmUseCase {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  /**
   * Ejecuta el caso de uso.
   * @param {string} uid - El UID del usuario.
   * @param {string} token - El token de restablecimiento.
   * @param {string} new_password - La nueva contraseña.
   * @param {string} re_new_password - Repetición de la nueva contraseña.
   * @returns {Promise<any>} Promesa con la respuesta de la API.
   */
  async execute(uid, token, new_password, re_new_password) {
    return await this.authRepository.resetPasswordConfirm(uid, token, new_password, re_new_password);
  }
}
