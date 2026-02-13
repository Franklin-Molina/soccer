/**
 * @typedef {object} CourtImage
 * @property {number} id - El ID de la imagen.
 * @property {string} image - La URL de la imagen.
 */

/**
 * Entidad de dominio que representa una cancha.
 * Define la estructura de los datos de una cancha en la capa de Dominio.
 * No debe contener lógica de negocio compleja ni depender de detalles de infraestructura.
 */
export class Court {
  /**
   * @param {object} data - Los datos para inicializar la entidad Court.
   * @param {number} data.id - El ID de la cancha.
   * @param {string} data.name - El nombre de la cancha.
   * @param {number} data.price - El precio por hora de la cancha.
   * @param {string} [data.description] - La descripción de la cancha.
   * @param {string} [data.characteristics] - Las características de la cancha.
   * @param {boolean} [data.is_active] - Indica si la cancha está activa o suspendida.
   * @param {CourtImage[]} [data.images] - Las imágenes de la cancha.
   */
  constructor({ id, name, price, description, characteristics, is_active, images }) {
    if (id === undefined || name === undefined || price === undefined) {
      throw new Error('Court entity requires id, name, and price.');
    }
    this.id = id;
    this.name = name;
    this.price = price;
    this.description = description;
    this.characteristics = characteristics;
    this.is_active = is_active; // Asignar la propiedad is_active
    this.images = images || [];
  }
}
