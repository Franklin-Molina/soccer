import { AuthTokens, AuthenticatedUser } from '../entities/auth'; // Importar las entidades de autenticación

/**
 * Interfaz que define el contrato para un repositorio de autenticación.
 * Cualquier implementación de este repositorio debe adherirse a esta interfaz.
 * Esta interfaz reside en la capa de Dominio y no debe depender de capas externas.
 */
export class IAuthRepository {
  /**
   * Intenta iniciar sesión con credenciales de usuario.
   * @param {string} username - El nombre de usuario.
   * @param {string} password - La contraseña.
   * @returns {Promise<AuthTokens>} Una promesa que resuelve con los tokens de autenticación.
   */
  async login(username, password) {
    throw new Error('Method not implemented.');
  }

  /**
   * Intenta iniciar sesión con un token de acceso de Google.
   * @param {string} googleAccessToken - El token de acceso de Google.
   * @returns {Promise<AuthTokens>} Una promesa que resuelve con los tokens de autenticación.
   */
  async loginWithGoogle(googleAccessToken) {
    throw new Error('Method not implemented.');
  }

  /**
   * Cierra la sesión del usuario.
   * @returns {Promise<void>} Una promesa que resuelve cuando la sesión se ha cerrado.
   */
  async logout() {
    throw new Error('Method not implemented.');
  }

  /**
   * Obtiene la información del usuario autenticado.
   * @returns {Promise<AuthenticatedUser | null>} Una promesa que resuelve con la entidad AuthenticatedUser o null si no hay usuario autenticado.
   */
  async getAuthenticatedUser() {
    throw new Error('Method not implemented.');
  }

  /**
   * Guarda los tokens de autenticación.
   * @param {AuthTokens} tokens - Los tokens a guardar.
   * @returns {Promise<void>} Una promesa que resuelve cuando los tokens se han guardado.
   */
  async saveTokens(tokens) {
    throw new Error('Method not implemented.');
  }

  /**
   * Obtiene los tokens de autenticación guardados.
   * @returns {Promise<AuthTokens | null>} Una promesa que resuelve con los tokens guardados o null si no hay tokens.
   */
  async getTokens() {
    throw new Error('Method not implemented.');
  }

  /**
   * Elimina los tokens de autenticación guardados.
   * @returns {Promise<void>} Una promesa que resuelve cuando los tokens se han eliminado.
   */
  async removeTokens() {
    throw new Error('Method not implemented.');
  }

  /**
   * Solicita el restablecimiento de contraseña.
   * @param {string} email - El correo electrónico del usuario.
   */
  async resetPassword(email) {
    throw new Error('Method not implemented.');
  }

  /**
   * Confirma el restablecimiento de contraseña.
   * @param {string} uid - El UID del usuario.
   * @param {string} token - El token de restablecimiento.
   * @param {string} new_password - La nueva contraseña.
   * @param {string} re_new_password - Repetición de la nueva contraseña.
   */
  async resetPasswordConfirm(uid, token, new_password, re_new_password) {
    throw new Error('Method not implemented.');
  }

  // TODO: Añadir métodos para refrescar tokens, registrar usuario, etc. si son necesarios
}
