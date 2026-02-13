import api from '../api/api.js'; // Importar la instancia de axios configurada
import { ICourtRepository } from '../../domain/repositories/court-repository'; // Importar la interfaz del repositorio
import { Court } from '../../domain/entities/court'; // Importar la entidad Court

/**
 * Implementación del repositorio de canchas que utiliza la API REST.
 * Esta clase reside en la capa de Infraestructura e implementa la interfaz ICourtRepository
 * definida en la capa de Dominio.
 */
export class ApiCourtRepository extends ICourtRepository {
  /**
   * Obtiene una lista de todas las canchas desde la API.
   * @returns {Promise<Court[]>} Una promesa que resuelve con un array de entidades Court.
   */
  async getCourts(filters = {}) {
    try {
      const response = await api.get('/api/courts/', { params: filters }); // Llamada a la API usando la instancia configurada y pasando filtros
      // Mapear los datos de la respuesta a entidades Court del Dominio
      return response.data.map(courtData => new Court(courtData));
    } catch (error) {
      // console.error('Error fetching courts from API:', error); // Eliminado mensaje de consola
      throw error; // Relanzar el error para que la capa superior lo maneje
    }
  }

  /**
   * Obtiene los detalles de una cancha específica por su ID desde la API.
   * @param {number} courtId - El ID de la cancha.
   * @returns {Promise<Court>} Una promesa que resuelve con la entidad Court.
   */
  async getCourtById(courtId) {
    try {
      const response = await api.get(`/api/courts/${courtId}/`); // Llamada a la API
      // Mapear los datos de la respuesta a una entidad Court del Dominio
      return new Court(response.data);
    } catch (error) {
      // console.error(`Error fetching court ${courtId} from API:`, error); // Eliminado mensaje de consola
      throw error; // Relanzar el error
    }
  }

  /**
   * Crea una nueva cancha a través de la API.
   * @param {object} courtData - Los datos para crear la cancha.
   * @param {string} courtData.name - El nombre de la cancha.
   * @param {number} courtData.price - El precio por hora.
   * @param {string} [courtData.description] - La descripción.
   * @param {string} [courtData.characteristics] - Las características.
   * @param {File[]} [courtData.images] - Los archivos de imagen.
   * @returns {Promise<Court>} Una promesa que resuelve con la entidad Court creada.
   */
  async createCourt(courtData) {
    try {
      // Crear objeto FormData para enviar archivos
      const data = new FormData();
      data.append('name', courtData.name);
      data.append('price', courtData.price);
      if (courtData.description) data.append('description', courtData.description);
      if (courtData.characteristics) data.append('characteristics', courtData.characteristics);

      // Añadir cada archivo de imagen al FormData
      if (courtData.images && courtData.images.length > 0) {
        courtData.images.forEach((image) => {
          data.append(`images`, image); // Usar el mismo nombre 'images' para todos los archivos
        });
      }

      // Enviar datos al backend usando FormData
      // El token de autorización se adjunta automáticamente por el interceptor de api.js
      const response = await api.post('/api/courts/', data, {
         headers: {
            'Content-Type': 'multipart/form-data', // Importante para enviar FormData
         },
      });
      // Mapear los datos de la respuesta a una entidad Court del Dominio
      return new Court(response.data);
    } catch (error) {
      // console.error('Error creating court via API:', error); // Eliminado mensaje de consola
      throw error; // Relanzar el error
    }
  }

  /**
   * Verifica la disponibilidad de canchas para un rango de tiempo específico a través de la API.
   * @param {string} startTime - La fecha y hora de inicio (ISO 8601).
   * @param {string} endTime - La fecha y hora de fin (ISO 8601).
   * @returns {Promise<object[]>} Una promesa que resuelve con un array de objetos indicando la disponibilidad de cada cancha.
   */
  async checkAvailability(startTime, endTime) {
    try {
      const response = await api.get('/api/courts/availability/', {
        params: {
          start_time: startTime,
          end_time: endTime,
        },
      });
      // La respuesta de la API ya debería tener el formato esperado [{ id, name, is_available }, ...]
      return response.data;
    } catch (error) {
      // console.error('Error checking availability via API:', error); // Eliminado mensaje de consola
      throw error; // Relanzar el error
    }
  }

  /**
   * Obtiene la disponibilidad semanal para una cancha específica desde la API.
   * @param {number} courtId - El ID de la cancha.
   * @param {string} start_date - La fecha de inicio de la semana (ISO 8601).
   * @param {string} end_date - La fecha de fin de la semana (ISO 8601).
   * @returns {Promise<object>} Una promesa que resuelve con un objeto que representa la disponibilidad semanal.
   */
  async getWeeklyAvailability(courtId, start_date, end_date) {
    try {
      // Llamada al nuevo endpoint del backend para disponibilidad semanal
      const response = await api.get(`/api/courts/${courtId}/weekly-availability/`, {
        params: {
          start_date: start_date,
          end_date: end_date,
        },
      });
      // Asumiendo que la API devuelve el formato { 'YYYY-MM-DD': { hour: boolean, ... }, ... }
      return response.data;
    } catch (error) {
      // console.error(`Error fetching weekly availability for court ${courtId}:`, error); // Eliminado mensaje de consola
      throw error; // Relanzar el error
    }
  }

  /**
   * Actualiza el estado (activo/inactivo) de una cancha.
   * @param {number} courtId - El ID de la cancha.
   * @param {boolean} isActive - El nuevo estado de activación.
   * @returns {Promise<object>} Una promesa que resuelve con el objeto de la cancha actualizado.
   */
  async updateCourtStatus(courtId, isActive) {
    try {
      // Usar el endpoint PATCH /api/courts/<id>/ para actualizar el estado
      const response = await api.patch(`/api/courts/${courtId}/`, { is_active: isActive });
      // return new Court(response.data); // Si la API devuelve la cancha actualizada
      return response.data; // O simplemente un mensaje de éxito
    } catch (error) {
      // console.error(`Error updating court ${courtId} status via API:`, error); // Eliminado mensaje de consola
      throw error;
    }
  }
  /**
   * Elimina una cancha específica por su ID a través de la API.
   * @param {number} courtId - El ID de la cancha a eliminar.
   * @returns {Promise<void>} Una promesa que resuelve cuando la cancha ha sido eliminada.
   */
  async deleteCourt(courtId) {
    try {
      await api.delete(`/api/courts/${courtId}/`);
    } catch (error) {
      // console.error(`Error deleting court ${courtId} via API:`, error); // Eliminado mensaje de consola
      throw error; // Relanzar el error
    }
  }

  /**
   * Actualiza una cancha existente a través de la API.
   * Soporta la actualización de campos y la gestión de imágenes (agregar nuevas y eliminar existentes).
   * @param {number} courtId - El ID de la cancha a actualizar.
   * @param {FormData} courtData - Los datos actualizados de la cancha, incluyendo archivos de imagen si es necesario.
   * @returns {Promise<Court>} Una promesa que resuelve con la entidad Court actualizada.
   */
  async updateCourt(courtId, courtData) {
    try {
      // Usar el endpoint PATCH /api/courts/<id>/ para actualizaciones parciales
      // Enviar FormData para soportar archivos
      const response = await api.patch(`/api/courts/${courtId}/`, courtData, {
         headers: {
            'Content-Type': 'multipart/form-data', // Importante para enviar FormData
         },
      });
      // Mapear los datos de la respuesta a una entidad Court del Dominio
      return new Court(response.data);
    } catch (error) {
      // console.error(`Error updating court ${courtId} via API:`, error); // Eliminado mensaje de consola
      throw error; // Relanzar el error
    }
  }


  // TODO: Implementar otros métodos de ICourtRepository si se añaden
}
