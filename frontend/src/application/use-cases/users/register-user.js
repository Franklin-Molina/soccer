/**
 * @class RegisterUserUseCase
 * @description Caso de uso para registrar un nuevo usuario.
 */
export class RegisterUserUseCase {
  /**
   * @param {object} userRepository - El repositorio de usuarios que implementa la interfaz de usuario.
   */
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Ejecuta el caso de uso para registrar un usuario.
   * @param {string} username - Nombre de usuario.
   * @param {string} email - Correo electrónico.
   * @param {string} password - Contraseña.
   * @param {string} firstName - Nombre.
   * @param {string} lastName - Apellido.
   * @param {number} age - Edad.
   * @returns {Promise<object>} Los datos del usuario registrado.
   * @throws {Error} Si el registro falla.
   */
  async execute(username, email, password, firstName, lastName, age) {
    try {
      const userData = {
        username,
        email,
        password,
        password2: password, // Añadir password2 para que coincida con el serializador del backend
        first_name: firstName,
        last_name: lastName,
        edad: age, // Cambiar 'age' a 'edad' para que coincida con el serializador del backend
      };
      const newUser = await this.userRepository.registerUser(userData);
      return newUser;
    } catch (error) {
      console.error("Error en el caso de uso de registro de usuario:", error);
      throw error;
    }
  }
}
