// frontend/src/application/use-cases/change-password.js

export class ChangePasswordUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId, currentPassword, newPassword) {
    // TODO: Implementar la lógica para llamar al repositorio y cambiar la contraseña
    // Validar que las contraseñas no estén vacías antes de llamar al repositorio
    if (!currentPassword || !newPassword) {
      throw new Error("La contraseña actual y la nueva contraseña son requeridas.");
    }

    // Llamar al repositorio para cambiar la contraseña
    const result = await this.userRepository.changePassword(userId, currentPassword, newPassword);
    return result;
  }
}
