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
      const { user } = response.data; 
      
      localStorage.setItem('hasSession', 'true');
      // Ya no recibimos ni guardamos tokens explícitamente en localStorage
      // Las cookies son manejadas automáticamente por el navegador y withCredentials: true
      
      const authenticatedUserInstance = new AuthenticatedUser(user);
      localStorage.setItem('hasSession', 'true');
      return { user: authenticatedUserInstance };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Intenta iniciar sesión con un token de acceso de Google a través de la API.
   * @param {string} googleAccessToken - El token de acceso de Google.
   * @returns {Promise<AuthTokens>} Una promesa que resuelve con los tokens de autenticación.
   */
  async loginWithGoogle(googleAccessToken) {
    // Nota: El backend de Google Login también debería actualizarse para usar cookies
    // Por ahora, asumimos que se ajustará similar a LoginView
    try {
      const response = await api.post('/api/users/google/', { access_token: googleAccessToken });
      return response.data;
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
    try {
      await api.post('/api/users/logout/');
    } catch (error) {
      console.error('Error calling backend logout:', error);
    }
    await this.removeTokens();
    localStorage.removeItem('hasSession');
  }

  /**
   * Obtiene la información del usuario autenticado desde la API.
   * @returns {Promise<AuthenticatedUser | null>} Una promesa que resuelve con la entidad AuthenticatedUser o null.
   */
  async getAuthenticatedUser() {
    try {
      // Intentamos obtener el usuario actual. Si no hay cookie válida, fallará con 401
      const response = await api.get('/api/users/users/me/');
      return new AuthenticatedUser(response.data);
    } catch (error) {
      // Si hay un error (ej. 401), el usuario no está autenticado
      return null;
    }
  }

  /**
   * Guarda los tokens de autenticación (deprecated).
   */
  async saveTokens(tokens) {
    // No hacer nada, las cookies se encargan
  }

  /**
   * Obtiene los tokens de autenticación (deprecated).
   */
  async getTokens() {
    // No podemos acceder a cookies HttpOnly desde JS
    return null;
  }

  /**
   * Elimina los tokens de autenticación de localStorage (limpieza).
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

  async validatePasswordResetToken(uid, token) {
    try {
      await api.post('/api/users/auth/users/reset_password_confirm/validate_token/', {
        uid,
        token
      });
      return true;
    } catch (error) {
      // Si el backend responde 400, el token es inválido
      return false;
    }
  }


}
