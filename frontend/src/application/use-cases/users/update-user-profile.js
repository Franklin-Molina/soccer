/**
 * Caso de Uso para actualizar el perfil de un usuario.
 */
export class UpdateUserProfileUseCase {
  /**
   * @param {UserRepository} userRepository - El repositorio de usuarios a utilizar.
   */
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Ejecuta el caso de uso para actualizar el perfil de un usuario.
   * @param {number} userId - El ID del usuario a actualizar.
   * @param {object} userData - Los datos del usuario a actualizar.
   * @returns {Promise<User>} Una promesa que resuelve con el usuario actualizado.
   * @throws {Error} Si ocurre un error durante la actualización.
   */
  async execute(userId, userData) {
    try {
      // Aquí podrías añadir lógica de negocio adicional si fuera necesario
      // antes de llamar al repositorio.

      const updatedUser = await this.userRepository.updateUser(userId, userData);
      return updatedUser;
    } catch (error) {
      console.error("Error in UpdateUserProfileUseCase:", error);
      throw error; // Propagar el error para que la capa de presentación lo maneje
    }
  }
}
