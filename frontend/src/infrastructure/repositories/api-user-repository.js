import api from '../api/api.js'; // Importar la instancia de axios configurada
import { IUserRepository } from '../../domain/repositories/user-repository.js';
// import { User } from '../../domain/entities/user'; // Si se define una entidad User en frontend

/**
 * Implementación del repositorio de usuarios que utiliza la API REST.
 */
export class ApiUserRepository extends IUserRepository {
  /**
   * Obtiene una lista de todos los usuarios, con filtros opcionales.
   * @param {object} [filters] - Filtros opcionales (ej. { role: 'admin' }).
   * @returns {Promise<object[]>} Una promesa que resuelve con un array de objetos de usuario.
   */
  async getAlladmins(filters) {
    try {
      // El endpoint /api/users/manage-admins/ ya filtra por role='admin' en el backend (AdminManagementViewSet)
      // Si se necesitan otros filtros, se pueden pasar como params.
      const response = await api.get('/api/users/manage-admins/', { params: filters });
      // return response.data.map(userData => new User(userData)); // Si se usa entidad User
      return response.data;
    } catch (error) {
     // console.error('Error fetching users from API:', error);
      throw error;
    }
  }
    async getAllUsers(filters) {
    try {
      // Usar el endpoint específico para la lista de usuarios según la respuesta del router
      const response = await api.get('/api/users/users/', { params: filters }); // Cambiar la URL
      // return response.data.map(userData => new User(userData)); // Si se usa entidad User
      return response.data;
    } catch (error) {
     // console.error('Error fetching users from API:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo usuario admin de cancha.
   * @param {object} userData - Datos del usuario a crear.
   * @returns {Promise<object>} Una promesa que resuelve con el objeto del usuario creado.
   */
  async createAdminUser(userData) {
    try {
      // Usar el endpoint /api/users/admin/register/ que ya existe y está protegido
      const response = await api.post('/api/users/admin/register/', userData);
      // return new User(response.data); // Si se usa entidad User
      return response.data;
    } catch (error) {
      console.error('Error creating admin user via API:', error);
      throw error;
    }
  }

  /**
   * Actualiza el estado (activo/inactivo) de un usuario.
   * @param {number} userId - El ID del usuario.
   * @param {boolean} isActive - El nuevo estado de activación.
   * @returns {Promise<object>} Una promesa que resuelve con el objeto del usuario actualizado.
   */
  async updateUserStatus(userId, isActive) {
    try {
      const action = isActive ? 'reactivate' : 'suspend';
      // Usar el endpoint /api/users/manage-admins/<id>/[suspend|reactivate]/
      const response = await api.patch(`/api/users/manage-admins/${userId}/${action}/`);
      // return new User(response.data); // Si la API devuelve el usuario actualizado
      return response.data; // O simplemente un mensaje de éxito
    } catch (error) {
      console.error(`Error updating user ${userId} status via API:`, error);
      throw error;
    }
  }
  
  /**
   * Actualiza el estado (activo/inactivo) de un usuario con rol 'cliente'.
   * @param {number} userId - El ID del usuario.
   * @param {boolean} isActive - El nuevo estado de activación.
   * @returns {Promise<object>} Una promesa que resuelve con el objeto del usuario actualizado.
   */
  async updateClientUserStatus(userId, isActive) {
    try {
      const action = isActive ? 'activate' : 'deactivate';
      // Usar los endpoints /api/users/<id>/[activate|deactivate]/ del UserViewSet
      const response = await api.patch(`/api/users/users/${userId}/${action}/`);
      // return new User(response.data); // Si la API devuelve el usuario actualizado
      return response.data; // O simplemente un mensaje de éxito
    } catch (error) {
      console.error(`Error updating client user ${userId} status via API:`, error);
      throw error;
    }
  }

  /**
   * Elimina un usuario.
   * @param {number} userId - El ID del usuario.
   * @returns {Promise<void>} Una promesa que resuelve cuando el usuario ha sido eliminado.
   */
  async deleteUser(userId) {
    try {
      // Usar el endpoint /api/users/manage-admins/<id>/
      await api.delete(`/api/users/manage-admins/${userId}/`);
    } catch (error) {
      console.error(`Error deleting user ${userId} via API:`, error);
      throw error;
    }
  }
    async deleteOnlyUsers(userId) {
    try {
      // Usar el endpoint /api/users/manage-admins/<id>/
      await api.delete(`/api/users/users/${userId}/`);
    } catch (error) {
      console.error(`Error deleting user ${userId} via API:`, error);
      throw error;
    }
  }

  /**
   * Actualiza los datos de un usuario.
   * @param {number} userId - El ID del usuario a actualizar.
   * @param {object} userData - Los datos del usuario a actualizar.
   * @returns {Promise<object>} Una promesa que resuelve con el objeto del usuario actualizado.
   */
  async updateUser(userId, userData) { // Añadido userId
    try {
      // Usar el endpoint PATCH para actualizar el perfil del usuario autenticado
      const response = await api.patch(`/api/users/profile/`, userData); // Cambiada la URL a /users/profile/
      // return new User(response.data); // Si se usa entidad User
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${userId} via API:`, error); // Mensaje de error actualizado
      throw error;
    }
  }

  /**
   * Cambia la contraseña de un usuario.
   * @param {number} userId - El ID del usuario.
   * @param {string} currentPassword - La contraseña actual del usuario.
   * @param {string} newPassword - La nueva contraseña para el usuario.
   * @returns {Promise<object>} Una promesa que resuelve con un mensaje de éxito o error.
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Asumiendo un endpoint en el backend para cambiar la contraseña
      const response = await api.post(`/api/users/change-password/`, {
        current_password: currentPassword,
        new_password: newPassword,
      });
      return response.data;
    } catch (error) {
     // console.error(`Error changing password for user ${userId} via API:`, error);
      throw error;
    }
  }

  /**
   * Registra un nuevo usuario general.
   * @param {object} userData - Datos del usuario a registrar (username, email, password, first_name, last_name, age).
   * @returns {Promise<object>} Una promesa que resuelve con los datos del usuario registrado.
   */
  async registerUser(userData) {
    try {
      const response = await api.post('/api/users/register/', userData);
      return response.data;
    } catch (error) {
      console.error('Error al registrar usuario via API:', error);
      throw error;
    }
  }
}
