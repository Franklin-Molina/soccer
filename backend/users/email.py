from djoser import email
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

class PasswordResetEmail(email.PasswordResetEmail):
    """
    Clase para enviar el correo de restablecimiento de contraseña.
    Sobrescribimos completamente el método send para usar EmailMultiAlternatives.
    """
    template_name = 'registration/password_reset_email.html'

    def get_subject(self):
        return "Restablecimiento de contraseña en Sintetíca Iris"

    def send(self, to, *args, **kwargs):
        # 1. Obtener el contexto que Djoser ya preparó (incluye user, domain, protocol, uid, token)
        context = self.get_context_data()
        # context['site_name'] = 'Sintetíca Iris',
        # context['domain'] = 'localhost:5173'
        
        
        # 2. Renderizar el HTML usando la plantilla profesional
        html_content = render_to_string(self.template_name, context)
        # 3. Crear versión en texto plano por seguridad
        text_content = strip_tags(html_content)
        
        # 4. Configurar el correo multi-parte
        subject = self.get_subject()
        from_email = settings.DEFAULT_FROM_EMAIL
        
        try:
            email_msg = EmailMultiAlternatives(
                subject,
                text_content,
                from_email,
                to
            )
            email_msg.attach_alternative(html_content, "text/html")
            email_msg.send()
            return True
        except Exception as e:
            # Puedes imprimir el error para depuración si es necesario
            print(f"Error enviando correo: {e}")
            return False

class PasswordChangedConfirmationEmail(email.PasswordChangedConfirmationEmail):
    """
    Clase para enviar el correo de confirmación de cambio de contraseña.
    """
    template_name = 'registration/password_changed_confirmation_email.html'

    def get_subject(self):
        return "Confirmación de cambio de contraseña en SINTETÍCA IRIS"

    def send(self, to, *args, **kwargs):
        context = self.get_context_data()
        # context['site_name'] = 'Sintetíca Iris'
        # context['domain'] = 'localhost:5173'
        
        html_content = render_to_string(self.template_name, context)
        text_content = strip_tags(html_content)
        
        subject = self.get_subject()
        from_email = settings.DEFAULT_FROM_EMAIL
        
        try:
            email_msg = EmailMultiAlternatives(
                subject,
                text_content,
                from_email,
                to
            )
            email_msg.attach_alternative(html_content, "text/html")
            email_msg.send()
            return True
        except Exception as e:
            print(f"Error enviando correo de confirmación: {e}")
            return False
