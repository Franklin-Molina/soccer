from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Role, PerfilSocial, SuscripcionPlan

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # Añadimos los campos personalizados al panel de administración
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('role', 'fecha_nacimiento')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('role', 'fecha_nacimiento')}),
    )
    list_display = UserAdmin.list_display + ('role',)

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')

@admin.register(PerfilSocial)
class PerfilSocialAdmin(admin.ModelAdmin):
    list_display = ('user', 'provider', 'uid')

@admin.register(SuscripcionPlan)
class SuscripcionPlanAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan', 'start_date', 'end_date', 'status')
    list_filter = ('status', 'plan')
