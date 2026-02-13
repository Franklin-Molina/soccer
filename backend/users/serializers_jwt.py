from rest_framework_simplejwt.serializers import TokenObtainPairSerializer 
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserSerializer # Importar UserSerializer
import logging
import re

logger = logging.getLogger(__name__)

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    # Campos esperados
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

      #  logger.debug(f"Atributos recibidos en el serializador: {attrs}")
      #  logger.debug(f"Intentando autenticar usuario: {username}")

        # Verificación para evitar que se pasen tokens JWT como credenciales
        jwt_pattern = re.compile(r'^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$')
        if jwt_pattern.match(username) or jwt_pattern.match(password):
            logger.debug("Se detectó un token JWT enviado como username o password.")
            raise serializers.ValidationError("Formato inválido para usuario o contraseña.", code="invalid_format")

        try:
            user_authenticated = authenticate(username=username, password=password)
           # logger.debug(f"Resultado de authenticate: {user_authenticated}")

            if user_authenticated is None:
                # Si authenticate devuelve None, podría ser por credenciales incorrectas o usuario inactivo.
                # Intentar obtener el usuario por nombre de usuario para verificar si está inactivo.
                try:
                    user_obj = User.objects.get(username=username)
                    if not user_obj.is_active:
                        logger.debug(f"Autenticación fallida: usuario {username} inactivo.")
                        raise serializers.ValidationError("La cuenta de usuario está inactiva.", code="authorization")
                    else:
                        # El usuario existe y está activo, pero la contraseña es incorrecta.
                       # logger.debug("Autenticación fallida: credenciales inválidas (contraseña incorrecta).")
                        raise serializers.ValidationError("Credenciales inválidas", code="authorization")
                except User.DoesNotExist:
                    # El usuario no existe.
                    #logger.debug("Autenticación fallida: usuario no encontrado.")
                    raise serializers.ValidationError("Credenciales inválidas", code="authorization")
            
            # Si user_authenticated no es None, significa que el usuario se autenticó correctamente
            # y ModelBackend ya verificó que está activo (si es el backend por defecto).
            # La verificación user.is_active aquí es una doble comprobación o para backends personalizados.
            user = user_authenticated # Usar el usuario autenticado
            if not user.is_active: # Esta comprobación podría ser redundante si ModelBackend ya la hizo
                logger.debug(f"Autenticación fallida: usuario {user.username} inactivo (verificación post-authenticate).")
                raise serializers.ValidationError("La cuenta de usuario está inactiva.", code="authorization")

          #  logger.debug(f"Usuario autenticado: {user.username}, is_active: {user.is_active}")

        except serializers.ValidationError:
            # Si es una ValidationError lanzada intencionalmente (ej. cuenta inactiva, credenciales inválidas),
            # relanzarla tal cual para que DRF la maneje y envíe el mensaje correcto.
            raise
        except Exception as e:
            # Para cualquier otra excepción inesperada, loguear y lanzar un error genérico.
            logger.error(f"Error inesperado durante la autenticación: {e}", exc_info=True)
            raise serializers.ValidationError("Error interno del servidor durante la autenticación.", code="internal_server_error") # Usar un mensaje más genérico para errores inesperados

        # Asignar el usuario autenticado para que la clase base genere los tokens
        self.user = user
        data = super().validate(attrs)

        # Serializar el objeto de usuario
        user_serializer = UserSerializer(self.user)
        
        # Añadir los datos serializados del usuario a la respuesta bajo la clave 'user'
        data['user'] = user_serializer.data

        return data
