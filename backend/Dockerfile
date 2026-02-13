# Usar una imagen base de Python
FROM python:3.11-slim

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiar los archivos de requisitos e instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del código de la aplicación
COPY . .

# Hacer el script de construcción ejecutable
RUN chmod +x build.sh

# Exponer el puerto en el que se ejecuta Django
EXPOSE 8000

# Comando para ejecutar la aplicación Django usando Gunicorn para producción
CMD sh -c "python manage.py migrate && gunicorn cancha.wsgi:application --bind 0.0.0.0:8000"
