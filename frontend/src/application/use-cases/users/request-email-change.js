/**
 * Caso de uso para solicitar un cambio de correo electrónico.
 */
export class RequestEmailChangeUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Ejecuta la solicitud de cambio de correo.
   * @param {string} newEmail - El nuevo correo electrónico.
   * @returns {Promise<object>} Respuesta del servidor.
   */
  async execute(newEmail) {
    if (!newEmail) {
      throw new Error('El nuevo correo es requerido.');
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      throw new Error('Ingresa un correo electrónico válido.');
    }

    return await this.userRepository.requestEmailChange(newEmail);
  }
}
