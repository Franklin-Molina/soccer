"""
URL configuration for cancha project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
"""
URL configuration for cancha project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from users import views as users_views # Importar vistas de la app users
from django.conf import settings # Importar settings
from django.conf.urls.static import static # Importar static
from django.shortcuts import redirect # Importar redirect
import os

FRONTEND_URL = os.getenv("FRONTEND_URL")

def password_reset_confirm_redirect(request, uidb64, token):
    return redirect(f"{settings.FRONTEND_URL}/password/reset/confirm/{uidb64}/{token}")


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/auth/', include('djoser.urls')),
    path('api/auth/', include('djoser.urls.jwt')),
    # Redundancia para asegurar que Djoser encuentre las rutas si se usan prefijos diferentes
    path('api/users/auth/', include('djoser.urls')),
    path('api/courts/', include('courts.urls')),
    path('api/bookings/', include('bookings.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/plans/', include('plans.urls')),
    path('api/matches/', include('matches.urls')),
    path('api/chat/', include('chat.urls')),
    # URLs de django-allauth
    path('accounts/', include('allauth.urls')),
    # URL para obtener la cookie CSRF
    path('api/csrf/', users_views.get_csrf_token, name='csrf_token'),
    # URL para manejar la redirección del restablecimiento de contraseña
    path('password/reset/confirm/<uidb64>/<token>/', password_reset_confirm_redirect, name='password_reset_confirm'),
]

# Configuración para servir archivos multimedia en modo desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
