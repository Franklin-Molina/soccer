// import { User } from '../entities/user'; // Asumiendo que existe una entidad User en el frontend

/**
 * Interfaz que define el contrato para un repositorio de usuarios en el frontend.
 * Esta interfaz reside en la capa de Dominio y no debe depender de capas externas.
 */
export class IUserRepository {
  /**
   * Obtiene una lista de todos los usuarios, con filtros opcionales.
   * @param {object} [filters] - Filtros opcionales (ej. { role: 'admin' }).
   * @returns {Promise<object[]>} Una promesa que resuelve con un array de objetos de usuario.
   *                              (Debería ser Promise<User[]> si se define la entidad User en frontend)
   */
  async getAllUsers(filters) {
    throw new Error('Method not implemented.');
  }

  /**
   * Crea un nuevo usuario (admin de cancha).
   * @param {object} userData - Datos del usuario a crear.
   * @returns {Promise<object>} Una promesa que resuelve con el objeto del usuario creado.
   */
  async createAdminUser(userData) {
    throw new Error('Method not implemented.');
  }

  /**
   * Actualiza el estado (activo/inactivo) de un usuario.
   * @param {number} userId - El ID del usuario.
   * @param {boolean} isActive - El nuevo estado de activación.
   * @returns {Promise<object>} Una promesa que resuelve con el objeto del usuario actualizado.
   */
  async updateUserStatus(userId, isActive) {
    throw new Error('Method not implemented.');
  }

  /**
   * Elimina un usuario.
   * @param {number} userId - El ID del usuario.
   * @returns {Promise<void>} Una promesa que resuelve cuando el usuario ha sido eliminado.
   */
  async deleteUser(userId) {
    throw new Error('Method not implemented.');
  }
  
  // Otros métodos relacionados con usuarios si son necesarios
}
