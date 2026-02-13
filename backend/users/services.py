from django.contrib.auth.models import Group, Permission

def crear_grupo_administradores():
    """
    Crea el grupo 'Administradores' y asigna permisos para gestionar usuarios.
    """
    administradores, created = Group.objects.get_or_create(name='Administradores')
    # Asignar permisos al grupo Administradores (ejemplo: cambiar usuarios)
    permisos = Permission.objects.filter(codename__startswith='change_user')
    administradores.permissions.set(permisos)


def crear_grupo_clientes():
    """
    Crea el grupo 'Clientes' y asigna permisos para ver canchas y crear reservas.
    """
    clientes, created = Group.objects.get_or_create(name='Clientes')
    # Asignar permisos al grupo Clientes (ejemplo: ver canchas y crear reservas)
    permisos = Permission.objects.filter(codename__in=['view_court', 'add_booking'])
    clientes.permissions.set(permisos)

def crear_grupo_gestores_cancha():
    """
    Crea el grupo 'Gestores de Cancha' y asigna permisos para gestionar canchas, reservas y clientes.
    """
    gestores, created = Group.objects.get_or_create(name='Gestores de Cancha')
    # Permisos para gestionar canchas
    permisos_canchas = Permission.objects.filter(
        content_type__app_label='courts', 
        codename__in=['add_court', 'change_court', 'delete_court', 'view_court']
    )
    # Permisos para gestionar reservas
    permisos_reservas = Permission.objects.filter(
        content_type__app_label='bookings',
        codename__in=['add_booking', 'change_booking', 'delete_booking', 'view_booking']
    )
    # Permisos para gestionar usuarios (clientes)
    permisos_usuarios = Permission.objects.filter(
        content_type__app_label='users',
        codename__in=['view_user', 'change_user'] # Asumir que 'change_user' permite activar/desactivar
    )
    
    permisos_totales = list(permisos_canchas) + list(permisos_reservas) + list(permisos_usuarios)
    gestores.permissions.set(permisos_totales)
