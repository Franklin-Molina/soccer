from django.db import migrations

def create_roles_and_assign_to_users(apps, schema_editor):
    User = apps.get_model('users', 'User')
    Role = apps.get_model('users', 'Role')

    # Crear los roles si no existen
    adminglobal_role, _ = Role.objects.get_or_create(name='adminglobal', defaults={'description': 'Administrador Global del Sistema'})
    admin_role, _ = Role.objects.get_or_create(name='admin', defaults={'description': 'Administrador de Cancha'})
    cliente_role, _ = Role.objects.get_or_create(name='cliente', defaults={'description': 'Usuario Cliente'})

    # Asignar los roles a los usuarios existentes basándose en is_staff y is_superuser
    # Es importante que esta lógica se ejecute *después* de que el campo role_id exista
    # y que los roles estén poblados.
    for user in User.objects.all():
        if user.is_superuser:
            user.role = adminglobal_role
        elif user.is_staff:
            user.role = admin_role
        else:
            user.role = cliente_role
        user.save()

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'), # Dependencia de la migración inicial que crea Role y User con FK
    ]

    operations = [
        migrations.RunPython(create_roles_and_assign_to_users),
    ]
