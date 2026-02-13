import api from '../api/api.js'; // Importar la instancia de axios configurada
import { IAuthRepository } from '../../domain/repositories/auth-repository'; // Importar la interfaz del repositorio
import { AuthTokens, AuthenticatedUser } from '../../domain/entities/auth'; // Importar las entidades de autenticación

/**
 * Implementación del repositorio de autenticación que utiliza la API REST y localStorage.
 * Esta clase reside en la capa de Infraestructura e implementa la interfaz IAuthRepository
 * definida en la capa de Dominio.
 */
export class ApiAuthRepository extends IAuthRepository {
  /**
   * Intenta iniciar sesión con credenciales de usuario a través de la API.
   * @param {string} username - El nombre de usuario.
   * @param {string} password - La contraseña.
   * @returns {Promise<AuthTokens>} Una promesa que resuelve con los tokens de autenticación.
   */
  async login(username, password) {
    try {
      const response = await api.post('/api/users/login/', { username, password });
      const { access, refresh, user } = response.data; // Extraer access, refresh, y user
      const tokens = new AuthTokens({ access, refresh });
      await this.saveTokens(tokens); // Guardar tokens después de un login exitoso
      
      // Crear instancia de AuthenticatedUser y devolver tokens y usuario
      const authenticatedUserInstance = new AuthenticatedUser(user);
      return { tokens, user: authenticatedUserInstance };
    } catch (error) {
    //  console.error('Error logging in:', error);
      throw error;
    }
  }

  /**
   * Intenta iniciar sesión con un token de acceso de Google a través de la API.
   * @param {string} googleAccessToken - El token de acceso de Google.
   * @returns {Promise<AuthTokens>} Una promesa que resuelve con los tokens de autenticación.
   */
  async loginWithGoogle(googleAccessToken) {
    try {
      const response = await api.post('/api/users/google/', { access_token: googleAccessToken });
      const { access_token: access, refresh_token: refresh } = response.data;
      const tokens = new AuthTokens({ access, refresh });
      await this.saveTokens(tokens); // Guardar tokens después de un login exitoso
      return tokens;
    } catch (error) {
      console.error('Error logging in with Google:', error);
      throw error;
    }
  }

  /**
   * Cierra la sesión del usuario eliminando los tokens.
   * @returns {Promise<void>} Una promesa que resuelve cuando la sesión se ha cerrado.
   */
  async logout() {
    // Opcional: llamar a un endpoint de logout en el backend si existe
    // try {
    //   await api.post('/users/logout/');
    // } catch (error) {
    //   console.error('Error calling backend logout:', error);
    //   // Continuar eliminando tokens localmente incluso si la llamada al backend falla
    // }
    await this.removeTokens();
  }

  /**
   * Obtiene la información del usuario autenticado desde la API.
   * @returns {Promise<AuthenticatedUser | null>} Una promesa que resuelve con la entidad AuthenticatedUser o null.
   */
  async getAuthenticatedUser() {
    try {
      const tokens = await this.getTokens();
      if (!tokens || !tokens.access) {
        return null; // No hay tokens, no hay usuario autenticado
      }
      // La instancia de api ya adjunta el token de acceso si existe en localStorage
      const response = await api.get('/api/users/users/me/');
      return new AuthenticatedUser(response.data);
    } catch (error) {
   //   console.error('Error fetching authenticated user:', error);
      // Si hay un error (ej. 401), eliminar tokens locales
      if (error.response && error.response.status === 401) {
         await this.removeTokens();
      }
      throw error; // Relanzar el error
    }
  }

  /**
   * Guarda los tokens de autenticación en localStorage.
   * @param {AuthTokens} tokens - Los tokens a guardar.
   * @returns {Promise<void>} Una promesa que resuelve cuando los tokens se han guardado.
   */
  async saveTokens(tokens) {
    localStorage.setItem('accessToken', tokens.access);
    localStorage.setItem('refreshToken', tokens.refresh);
  }

  /**
   * Obtiene los tokens de autenticación desde localStorage.
   * @returns {Promise<AuthTokens | null>} Una promesa que resuelve con los tokens guardados o null.
   */
  async getTokens() {
    const access = localStorage.getItem('accessToken');
    const refresh = localStorage.getItem('refreshToken');
    if (access && refresh) {
      return new AuthTokens({ access, refresh });
    }
    return null;
  }

  /**
   * Elimina los tokens de autenticación de localStorage.
   * @returns {Promise<void>} Una promesa que resuelve cuando los tokens se han eliminado.
   */
  async removeTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  /**
   * Solicita el restablecimiento de contraseña a través de la API.
   * @param {string} email - El correo electrónico del usuario.
   */
  async resetPassword(email) {
    try {
      return await api.post('/api/auth/users/reset_password/', { email });
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  }

  /**
   * Confirma el restablecimiento de contraseña a través de la API.
   * @param {string} uid - El UID del usuario.
   * @param {string} token - El token de restablecimiento.
   * @param {string} new_password - La nueva contraseña.
   * @param {string} re_new_password - Repetición de la nueva contraseña.
   */
  async resetPasswordConfirm(uid, token, new_password, re_new_password) {
    try {
      return await api.post('/api/auth/users/reset_password_confirm/', {
        uid,
        token,
        new_password,
        re_new_password,
      });
    } catch (error) {
      console.error('Error confirming password reset:', error);
      throw error;
    }
  }

  // TODO: Implementar métodos para refrescar tokens, registrar usuario, etc.
}
