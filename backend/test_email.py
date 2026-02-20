import os
import django
from django.core.mail import send_mail

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cancha.settings')
django.setup()

def test_email():
    try:
        print("Intentando enviar correo de prueba...")
        sent = send_mail(
            'Prueba de Anymail Brevo',
            'Este es un correo de prueba para verificar la configuración de Anymail y Brevo.',
            None, # Usa DEFAULT_FROM_EMAIL
            ['frtin93@gmail.com'], # Cambia por tu correo de prueba si es necesario
            fail_silently=False,
        )
        print(f"Resultado del envío: {sent}")
    except Exception as e:
        print(f"Error detectado: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_email()
