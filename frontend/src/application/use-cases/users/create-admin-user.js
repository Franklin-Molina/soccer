// frontend/src/application/use-cases/create-admin-user.js

/**
 * Caso de Uso para registrar un nuevo usuario administrador.
 * Permite registrar un nuevo usuario con rol de administrador.
 */
export class CreateAdminUserUseCase {
  /**
   * @param {UserRepository} userRepository - El repositorio de usuarios a utilizar.
   */
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Ejecuta el caso de uso para registrar un nuevo usuario administrador.
   * @param {object} userData - Los datos del usuario administrador a registrar.
   * @returns {Promise<User>} Una promesa que resuelve con el usuario administrador registrado.
   * @throws {Error} Si ocurre un error durante el registro.
   */
  async execute(userData) {
    try {
      // Aquí podrías añadir lógica de negocio adicional si fuera necesario
      // antes de llamar al repositorio.

      const newUser = await this.userRepository.createAdminUser(userData);
      return newUser;
    } catch (error) {
      console.error("Error in CreateAdminUserUseCase:", error);
      throw error; // Propagar el error para que la capa de presentación lo maneje
    }
  }
}
