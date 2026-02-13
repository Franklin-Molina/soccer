from allauth.account.signals import user_signed_up
from allauth.socialaccount.models import SocialAccount
from django.dispatch import receiver
from .models import User

@receiver(user_signed_up)
def create_user_profile(sender, request, user, **kwargs):
    """
    Crea un perfil de usuario cuando un usuario se registra a través de una cuenta social.
    """
    social_account = SocialAccount.objects.get(user=user)
    extra_data = social_account.extra_data
    # Actualizar el perfil del usuario con la información de la cuenta social
    user.first_name = extra_data.get('given_name', '')
    user.last_name = extra_data.get('family_name', '')
    user.save()
