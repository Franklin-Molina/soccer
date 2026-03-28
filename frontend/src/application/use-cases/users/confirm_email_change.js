/**
 * Caso de uso para confirmar un cambio de correo electrónico.
 */
export class ConfirmEmailChangeUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Confirma el cambio de correo electrónico con el código de verificación.
   * @param {string} verificationCode - Código de 6 dígitos.
   * @returns {Promise<object>} Respuesta del servidor.
   */
  async execute(verificationCode) {
    if (!verificationCode) {
      throw new Error('El código de verificación es requerido.');
    }

    const cleanCode = verificationCode.replace(/\D/g, "");
    if (cleanCode.length !== 6) {
      throw new Error('El código de verificación debe tener exactamente 6 dígitos.');
    }

    return await this.userRepository.confirmEmailChange(cleanCode);
  }
}
