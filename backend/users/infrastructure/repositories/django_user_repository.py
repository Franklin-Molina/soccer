from typing import List, Optional, Dict, Any
from django.contrib.auth.hashers import make_password # Para hashear contraseñas
from asgiref.sync import sync_to_async
from django.contrib.auth.models import Group # Importar Group
from ...models import User, Role # Importar Role
from ...domain.repositories.user_repository import IUserRepository # Interfaz del Dominio

class DjangoUserRepository(IUserRepository):
    """
    Implementación del repositorio de usuarios que utiliza el ORM de Django.
    Esta clase reside en la capa de Infraestructura.
    """

    @sync_to_async
    def get_by_id(self, user_id: int) -> Optional[User]:
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None

    @sync_to_async
    def get_by_username(self, username: str) -> Optional[User]:
        try:
            return User.objects.get(username=username)
        except User.DoesNotExist:
            return None
            
    @sync_to_async
    def get_by_email(self, email: str) -> Optional[User]:
        try:
            return User.objects.get(email=email)
        except User.DoesNotExist:
            return None

    @sync_to_async
    def get_role_by_name(self, role_name: str) -> Optional[Role]:
        """
        Obtiene un objeto Role por su nombre.
        """
        try:
            return Role.objects.get(name=role_name)
        except Role.DoesNotExist:
            return None

    @sync_to_async
    def create(self, user_data: Dict[str, Any]) -> User:
        user_data.pop('password2', None) 
        
        role_obj = None
        if 'role' in user_data and user_data['role'] is not None:
            if isinstance(user_data['role'], Role):
                role_obj = user_data['role']
            else:
                try:
                    role_obj = Role.objects.get(pk=user_data['role'])
                except Role.DoesNotExist:
                    raise ValueError("El rol especificado no existe.")
        
        user_data['role'] = role_obj

        user = User.objects.create_user(**user_data)

        if role_obj:
            if role_obj.name == 'adminglobal':
                user.is_staff = True
                user.is_superuser = True
            elif role_obj.name == 'admin':
                user.is_staff = True
                try:
                    gestores_cancha_group = Group.objects.get(name='Gestores de Cancha')
                    user.groups.add(gestores_cancha_group)
                except Group.DoesNotExist:
                    print("Advertencia: El grupo 'Gestores de Cancha' no existe. El usuario admin no se añadió al grupo.")
        
        user.save()
        return user

    @sync_to_async
    def update(self, user_id: int, user_data: Dict[str, Any]) -> Optional[User]:
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None

        # Manejar la actualización del rol si se proporciona
        if 'role' in user_data and user_data['role'] is not None:
            role_value = user_data.pop('role') # Quitar el rol de user_data para manejarlo aparte
            role_obj = None
            if isinstance(role_value, Role):
                role_obj = role_value
            else: # Asumir que es un ID de rol
                try:
                    role_obj = Role.objects.get(pk=role_value)
                except Role.DoesNotExist:
                    raise ValueError("El rol especificado no existe.")
            user.role = role_obj # Asignar el objeto Role
            
            # Actualizar is_staff y is_superuser basado en el nuevo rol
            if role_obj:
                if role_obj.name == 'adminglobal':
                    user.is_staff = True
                    user.is_superuser = True
                elif role_obj.name == 'admin':
                    user.is_staff = True
                    user.is_superuser = False # Asegurarse de que no sea superuser si es solo admin
                elif role_obj.name == 'cliente':
                    user.is_staff = False
                    user.is_superuser = False
            else: # Si el rol se establece a None
                user.is_staff = False
                user.is_superuser = False

        # Actualizar otros campos del usuario
        for key, value in user_data.items():
            if key == 'password':
                setattr(user, key, make_password(value))
            elif hasattr(user, key):
                setattr(user, key, value)
        
        user.save()
        return user

    @sync_to_async
    def get_all(self, filters: Optional[Dict[str, Any]] = None) -> List[User]:
        queryset = User.objects.all()
        if filters:
            # Aplicar filtros si se proporcionan
            # Si el filtro es por 'role__name', usarlo directamente
            if 'role__name' in filters:
                queryset = queryset.filter(role__name=filters['role__name'])
            elif 'role' in filters: # Si el filtro es por ID de rol o nombre de rol
                role_value = filters['role']
                if isinstance(role_value, str):
                    queryset = queryset.filter(role__name=role_value)
                else: # Asumir que es un ID de rol
                    queryset = queryset.filter(role=role_value)
            # Añadir más filtros según sea necesario
        return list(queryset)

    @sync_to_async
    def delete(self, user_id: int) -> bool:
        try:
            user = User.objects.get(pk=user_id)
            user.delete()
            return True
        except User.DoesNotExist:
            return False

    @sync_to_async
    def set_password(self, user: User, new_password: str) -> None:
        """
        Establece la nueva contraseña para un usuario y la guarda.
        """
        user.set_password(new_password)
        user.save()
