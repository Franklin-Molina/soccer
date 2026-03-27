import random
from datetime import timedelta
from django.utils import timezone
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from typing import Optional
from asgiref.sync import sync_to_async
from ...domain.repositories.user_repository import IUserRepository
from ...models import EmailChangeRequest


class RequestEmailChangeUseCase:
    """
    Caso de uso para solicitar un cambio de correo electrónico.
    Genera un código de verificación y envía un correo al usuario.
    """

    def __init__(self, user_repository: IUserRepository):
        self.user_repository = user_repository

    async def execute(self, user_id: int, new_email: str) -> tuple[bool, str, Optional[EmailChangeRequest]]:
        """
        Ejecuta la lógica para solicitar un cambio de correo.

        Args:
            user_id (int): ID del usuario que solicita el cambio.
            new_email (str): Nueva dirección de correo electrónico.

        Returns:
            tuple: (success, message, request_object)
                - success (bool): Indica si la operación fue exitosa.
                - message (str): Mensaje descriptivo (error o confirmación).
                - request_object (EmailChangeRequest): La solicitud creada o None.
        """
        # Obtener el usuario
        user = await self.user_repository.get_by_id(user_id)
        if not user:
            return False, "Usuario no encontrado.", None

        # Validar que el nuevo correo no sea igual al actual
        if user.email == new_email:
            return False, "El nuevo correo debe ser diferente al actual.", None

        # Verificar si ya existe una solicitud pendiente para este usuario con el mismo nuevo correo
        existing_requests = await sync_to_async(lambda: list(EmailChangeRequest.objects.filter(
            user_id=user_id,
            new_email=new_email,
            is_verified=False
        ).order_by('-created_at')))()

        if existing_requests:
            # Reutilizar la solicitud más reciente si no ha expirado
            latest_request = existing_requests[0]
            if not latest_request.is_expired():
                return False, "Ya existe una solicitud pendiente para este correo. Revisa tu bandeja de entrada.", None
            # Si expiró, la eliminamos para crear una nueva
            await sync_to_async(latest_request.delete)()

        # Generar código de verificación de 6 dígitos
        verification_code = str(random.randint(100000, 999999))

        # Calcular fecha de expiración (30 minutos desde ahora)
        expires_at = timezone.now() + timedelta(minutes=30)

        # Crear la solicitud
        request = await self.user_repository.create_email_change_request(
            user_id=user_id,
            new_email=new_email,
            verification_code=verification_code,
            expires_at=expires_at
        )

        if not request:
            return False, "Error al crear la solicitud de cambio de correo.", None

        # Enviar correo de verificación
        try:
            await sync_to_async(self._send_verification_email)(user, new_email, verification_code)
        except Exception as e:
            # Si falla el envío, eliminar la solicitud y retornar error
            await sync_to_async(request.delete)()
            return False, f"Error al enviar el correo de verificación: {str(e)}", None

        return True, "Código de verificación enviado a tu nuevo correo.", request

    def _send_verification_email(self, user, new_email: str, verification_code: str):
        """
        Envía un correo electrónico con el código de verificación.
        """
        subject = "Verifica tu nuevo correo - Sintetíca Iris"
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [new_email]

        # Contexto para la plantilla
        context = {
            'user': user,
            'new_email': new_email,
            'verification_code': verification_code,
            'site_name': 'Sintetíca Iris',
        }

        # Renderizar plantilla HTML
        html_content = render_to_string('email/email_change_verification.html', context)
        text_content = render_to_string('email/email_change_verification.txt', context)

        # Crear y enviar correo
        email_msg = EmailMultiAlternatives(subject, text_content, from_email, recipient_list)
        email_msg.attach_alternative(html_content, "text/html")
        email_msg.send()
