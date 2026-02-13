from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission

class Command(BaseCommand):
    help = 'Crea los grupos de Administradores y Clientes con sus permisos.'

    def handle(self, *args, **options):
        # Crear grupo Administradores
        administradores, created = Group.objects.get_or_create(name='Administradores')
        if created:
            self.stdout.write(self.style.SUCCESS('Grupo "Administradores" creado.'))
        else:
            self.stdout.write(self.style.WARNING('Grupo "Administradores" ya existe.'))

        # Asignar permisos al grupo Administradores (ejemplo: cambiar usuarios)
        permisos_admin = Permission.objects.filter(codename__startswith='change_user')
        administradores.permissions.set(permisos_admin)
        self.stdout.write(self.style.SUCCESS('Permisos asignados al grupo "Administradores".'))

        # Crear grupo Clientes
        clientes, created = Group.objects.get_or_create(name='Clientes')
        if created:
            self.stdout.write(self.style.SUCCESS('Grupo "Clientes" creado.'))
        else:
            self.stdout.write(self.style.WARNING('Grupo "Clientes" ya existe.'))

        # Asignar permisos al grupo Clientes (ejemplo: ver canchas y crear reservas)
        permisos_cliente = Permission.objects.filter(codename__in=['view_court', 'add_booking'])
        clientes.permissions.set(permisos_cliente)
        self.stdout.write(self.style.SUCCESS('Permisos asignados al grupo "Clientes".'))

        self.stdout.write(self.style.SUCCESS('Configuración de permisos y grupos completada.'))
