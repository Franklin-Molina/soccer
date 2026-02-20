# Análisis de Configuración de Correos de Recuperación para Render

## Situación Actual
- ✅ Funcionalidad de recuperación de contraseña funciona correctamente en local
- ✅ Envía correos de recuperación correctamente en local
- ✅ Cambia la contraseña correctamente en local
- ❓ Necesita verificación para entorno de producción (Render)

## Configuración Actual vs Render

### 1. Configuración de Dominio y URLs

**Local (.env):**
```env
DOMAIN='localhost:5173'
SITE_NAME='Sintética Iris'
PROTOCOL='http'
```

**Render (render.yaml):**
```yaml
- key: CORS_ALLOWED_ORIGINS
  value: "https://cancha-sintetica-frontend.onrender.com"
- key: CSRF_TRUSTED_ORIGINS
  value: "https://cancha-sintetica-frontend.onrender.com"
```

**Problema identificado:**
- El `DOMAIN` en Render debería ser `cancha-sintetica-frontend.onrender.com`
- El `PROTOCOL` debería ser `https` (ya está configurado correctamente)
- Falta configurar `FRONTEND_URL` en Render para la redirección de password reset

### 2. Configuración de Email

**Local (.env):**
```env
EMAIL_BACKEND='django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST='smtp-relay.brevo.com'
EMAIL_PORT=587
EMAIL_USE_TLS=False
EMAIL_USE_SSL=False
EMAIL_HOST_USER='a1e10d001@smtp-brevo.com'
EMAIL_HOST_PASSWORD='xsmtpsib-72cccd4c80148d7fd9f220de1f0fbf1fa570090987b287c693e14ec4ef9248e1-h2OjqbwS11V6HriY'
DEFAULT_FROM_EMAIL='digitaldxz1@gmail.com'
```

**Render (render.yaml):**
```yaml
# Configuración de correo (rellenar en el dashboard de Render)
- key: EMAIL_HOST_USER
  sync: false
- key: EMAIL_HOST_PASSWORD
  sync: false
```

**Problema identificado:**
- Las credenciales de email deben configurarse manualmente en el dashboard de Render
- No están sincronizadas desde el archivo (sync: false)

### 3. Variables de Entorno Adicionales Necesarias

Para que funcione correctamente en Render, se necesitan estas variables adicionales:

```yaml
- key: DOMAIN
  value: "cancha-sintetica-frontend.onrender.com"
- key: SITE_NAME
  value: "Sintética Iris"
- key: PROTOCOL
  value: "https"
- key: FRONTEND_URL
  value: "https://cancha-sintetica-frontend.onrender.com"
- key: EMAIL_BACKEND
  value: "django.core.mail.backends.smtp.EmailBackend"
- key: EMAIL_HOST
  value: "smtp-relay.brevo.com"
- key: EMAIL_PORT
  value: "587"
- key: EMAIL_USE_TLS
  value: "False"
- key: EMAIL_USE_SSL
  value: "False"
- key: DEFAULT_FROM_EMAIL
  value: "digitaldxz1@gmail.com"
```

### 4. Configuración de Djoser

La configuración de Djoser en `settings.py` ya está correctamente configurada para usar los valores de entorno:

```python
DJOSER = {
    "DOMAIN": os.getenv("DOMAIN", "soccer-jet.vercel.app"),
    "SITE_NAME": os.getenv("SITE_NAME", "Sintética Iris"),
    "PROTOCOL": os.getenv("PROTOCOL", "https"),
    "EMAIL": {
        "password_reset": "users.email.PasswordResetEmail",
        "password_changed_confirmation": "users.email.PasswordChangedConfirmationEmail",
    },
}
```

### 5. Plantillas de Email

✅ Las plantillas ya están correctamente configuradas:
- `backend/templates/registration/password_reset_email.html`
- `backend/templates/registration/password_changed_confirmation_email.html`

### 6. Clases de Email Personalizadas

✅ Las clases personalizadas en `backend/users/email.py` ya están correctamente implementadas:
- `PasswordResetEmail` - Envía correos de restablecimiento de contraseña
- `PasswordChangedConfirmationEmail` - Envía confirmación de cambio de contraseña

## Recomendaciones para Render

1. **Configurar variables de entorno en Render Dashboard:**
   - Añadir todas las variables mencionadas arriba
   - Configurar `EMAIL_HOST_USER` y `EMAIL_HOST_PASSWORD` con las credenciales de Brevo

2. **Verificar configuración de CORS:**
   - Asegurar que `CORS_ALLOWED_ORIGINS` incluye el dominio del frontend
   - Asegurar que `CSRF_TRUSTED_ORIGINS` incluye el dominio del frontend

3. **Probar el flujo completo:**
   - Hacer una solicitud de recuperación de contraseña desde el frontend
   - Verificar que el correo llega correctamente
   - Verificar que el enlace en el correo redirige correctamente al frontend
   - Verificar que el cambio de contraseña funciona

4. **Configuración de seguridad adicional:**
   - Asegurar que `DEBUG=False` en producción
   - Asegurar que `ALLOWED_HOSTS` incluye el dominio de Render

## Configuración Recomendada para render.yaml

```yaml
services:
  - type: web
    name: cancha-backend
    env: docker
    rootDir: backend/
    plan: free
    healthCheckPath: /admin/login/
    envVars:
      # ... (otras variables existentes)

      # Configuración de dominio para emails y redirecciones
      - key: DOMAIN
        value: "cancha-sintetica-frontend.onrender.com"
      - key: SITE_NAME
        value: "Sintética Iris"
      - key: PROTOCOL
        value: "https"
      - key: FRONTEND_URL
        value: "https://cancha-sintetica-frontend.onrender.com"

      # Configuración de email (SMTP con Brevo)
      - key: EMAIL_BACKEND
        value: "django.core.mail.backends.smtp.EmailBackend"
      - key: EMAIL_HOST
        value: "smtp-relay.brevo.com"
      - key: EMAIL_PORT
        value: "587"
      - key: EMAIL_USE_TLS
        value: "False"
      - key: EMAIL_USE_SSL
        value: "False"
      - key: DEFAULT_FROM_EMAIL
        value: "digitaldxz1@gmail.com"
      - key: EMAIL_HOST_USER
        sync: false  # Configurar manualmente en dashboard
      - key: EMAIL_HOST_PASSWORD
        sync: false  # Configurar manualmente en dashboard
```

## Verificación Final

Para verificar que todo funciona correctamente en Render:

1. **Prueba de envío de correo:** Usar la API de Djoser para solicitar recuperación de contraseña
2. **Verificación de enlace:** Asegurar que el enlace en el correo apunta al frontend correcto
3. **Prueba de redirección:** Verificar que `/password/reset/confirm/<uidb64>/<token>/` redirige correctamente
4. **Prueba de cambio de contraseña:** Completar el flujo de cambio de contraseña

El código actual está bien implementado y debería funcionar correctamente en Render una vez configuradas las variables de entorno adecuadas.