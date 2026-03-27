from typing import Optional
from asgiref.sync import sync_to_async
from ...domain.repositories.user_repository import IUserRepository
from ...models import EmailChangeRequest


class ConfirmEmailChangeUseCase:
    """
    Caso de uso para confirmar un cambio de correo electrónico mediante código de verificación.
    """

    def __init__(self, user_repository: IUserRepository):
        self.user_repository = user_repository

    async def execute(self, verification_code: str, user_id: Optional[int] = None) -> tuple[bool, str, Optional[dict]]:
        """
        Ejecuta la lógica para confirmar el cambio de correo.

        Args:
            verification_code (str): Código de verificación de 6 dígitos.
            user_id (Optional[int]): ID del usuario que solicita el cambio. Si se proporciona,
                                     se verifica que la solicitud pertenezca a este usuario.

        Returns:
            tuple: (success, message, data)
                - success (bool): Indica si la operación fue exitosa.
                - message (str): Mensaje descriptivo (error o confirmación).
                - data (dict): Contiene 'new_email' si es exitoso, None en caso contrario.
        """
        # Buscar la solicitud por código
        request = await self.user_repository.get_email_change_request_by_code(verification_code)
        if not request:
            return False, "Código de verificación inválido o expirado.", None

        # Verificar que la solicitud no haya sido verificada ya
        if request.is_verified:
            return False, "Este código ya ha sido utilizado.", None

        # Verificar que la solicitud no haya expirado
        if request.is_expired():
            return False, "El código de verificación ha expirado. Por favor, solicita uno nuevo.", None

        # Si se proporciona user_id, verificar que la solicitud pertenezca al usuario
        if user_id is not None and request.user_id != user_id:
            return False, "Este código no es válido para este usuario.", None

        # Verificar que el nuevo correo no esté ya en uso por otro usuario
        # (esto se maneja en el serializer/update del usuario, pero es bueno validar aquí también)
        # Nota: El modelo User tiene email único, así que el update fallará si ya existe.
        # Podemos dejar que falle naturalmente o pre-validar.

        # Marcar la solicitud como verificada
        verified_request = await self.user_repository.mark_email_change_verified(request.id)
        if not verified_request:
            return False, "Error al verificar la solicitud.", None

        # Actualizar el correo del usuario
        user = request.user
        user.email = request.new_email
        await sync_to_async(user.save)()

        return True, "Correo electrónico actualizado exitosamente.", {'new_email': request.new_email}
