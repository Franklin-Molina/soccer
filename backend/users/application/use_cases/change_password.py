# backend/users/application/use_cases/change_password.py

from django.contrib.auth.hashers import check_password # Importar para verificar contraseña
from django.contrib.auth.password_validation import validate_password # Importar para validar nueva contraseña
from django.core.exceptions import ValidationError # Importar para manejar errores de validación

class ChangePasswordUseCase:
    def __init__(self, user_repository):
        self.user_repository = user_repository

    async def execute(self, user, current_password, new_password):
        """
        Cambia la contraseña de un usuario.

        Args:
            user (User): El objeto de usuario.
            current_password (str): La contraseña actual del usuario.
            new_password (str): La nueva contraseña para el usuario.

        Returns:
            bool: True si la contraseña se cambió exitosamente.

        Raises:
            ValueError: Si la contraseña actual es incorrecta o la nueva contraseña no es válida.
        """
        # Verificar la contraseña actual
        if not check_password(current_password, user.password):
            raise ValueError("La contraseña actual es incorrecta.")

        # Validar la nueva contraseña (opcional pero recomendado)
        try:
            validate_password(new_password, user)
        except ValidationError as e:
            raise ValueError(f"La nueva contraseña no es válida: {', '.join(e.messages)}")

        # Cambiar la contraseña usando el repositorio
        # El repositorio se encargará de hashear la nueva contraseña
        await self.user_repository.set_password(user, new_password)

        return True # Indicar éxito
