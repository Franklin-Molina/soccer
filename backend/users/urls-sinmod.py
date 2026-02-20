from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import RegisterView, UserViewSet, GroupViewSet, PermissionViewSet, GoogleLogin, AdminRegisterView, AdminManagementViewSet, UserProfileUpdateView, ChangePasswordView, LoginView, UserStatsView # Añadir LoginView y UserStatsView
from rest_framework import routers
from .models import User
from django.urls import path
# from .views import CustomTokenObtainPairView # Ya no es necesario si LoginView la reemplaza o si CustomTokenObtainPairView es la clase base de LoginView

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'groups', GroupViewSet)
router.register(r'permissions', PermissionViewSet)
router.register(r'manage-admins', AdminManagementViewSet, basename='manage-admin') # Registrar AdminManagementViewSet

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
   
    path('login/', LoginView.as_view(), name='token_obtain_pair'), # Cambiado a LoginView
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('google/', GoogleLogin.as_view(), name='google_login'),
    
    # La ruta admin/register/ ya existe y usa AdminRegisterView.
    # Esta vista permite crear usuarios con is_staff=True, que podrían ser 'admin' o 'adminglobal'.
    # La lógica en el repositorio DjangoUserRepository asigna is_superuser=True si role='adminglobal'.
    path('admin/register/', AdminRegisterView.as_view(), name='admin_register'), 

    # URL para obtener y actualizar el perfil del usuario autenticado
    path('profile/', UserProfileUpdateView.as_view(), name='user_profile_update'),
    # Ruta para cambiar la contraseña
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    
    # Ruta para obtener estadísticas de usuarios
    path('stats/', UserStatsView.as_view(), name='user_stats'),

    path('', include(router.urls)),
]
# Las rutas para listar, suspender, reactivar y eliminar admins de cancha
# ahora están manejadas por AdminManagementViewSet y registradas en el router.
