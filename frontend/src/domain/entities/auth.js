/**
 * Entidad de dominio que representa los tokens de autenticación.
 */
export class AuthTokens {
  /**
   * @param {object} data - Los datos para inicializar la entidad AuthTokens.
   * @param {string} data.access - El token de acceso.
   * @param {string} data.refresh - El token de refresco.
   */
  constructor({ access, refresh }) {
    if (!access || !refresh) {
      throw new Error('AuthTokens entity requires access and refresh tokens.');
    }
    this.access = access;
    this.refresh = refresh;
  }
}

/**
 * Entidad de dominio que representa un usuario autenticado.
 */
export class AuthenticatedUser {
  /**
   * @param {object} data - Los datos para inicializar la entidad AuthenticatedUser.
   * @param {number} data.id - El ID del usuario.
   * @param {string} data.username - El nombre de usuario.
   * @param {string} data.email - El email del usuario.
   * @param {boolean} data.is_staff - Indica si el usuario es staff/administrador.
   * @param {string} [data.first_name] - El nombre del usuario.
   * @param {string} [data.last_name] - El apellido del usuario.
   * @param {number} [data.edad] - La edad del usuario.
   * @param {string} [data.role] - El rol del usuario (ej. 'cliente', 'admin', 'adminglobal').
   * @param {boolean} [data.is_active] - Indica si el usuario está activo.
   * @param {object[]} [data.social_profiles] - Perfiles sociales vinculados.
   */
  constructor({ id, username, email, is_staff, is_active, first_name, last_name, edad, role, social_profiles }) {
    // Role podría no ser obligatorio si no todos los usuarios lo tienen o si se añade después
    // is_active también podría ser opcional si no siempre se envía, aunque es un campo estándar de User.
    if (id === undefined || !username || !email || is_staff === undefined || is_active === undefined) {
      throw new Error('AuthenticatedUser entity requires id, username, email, is_staff, and is_active.');
    }
    this.id = id;
    this.username = username;
    this.email = email;
    this.is_staff = is_staff;
    this.is_active = is_active; // Añadir is_active
    this.role = role; 
    this.first_name = first_name;
    this.last_name = last_name;
    this.edad = edad;
    this.social_profiles = social_profiles || [];
  }
}
