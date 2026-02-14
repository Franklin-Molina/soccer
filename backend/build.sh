#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate
#!/bin/sh


echo "Creando superusuario si no existe..."
python manage.py shell << END
import os
from django.contrib.auth import get_user_model

User = get_user_model()
username = os.environ.get("DJANGO_SUPERUSER_USERNAME")
email = os.environ.get("DJANGO_SUPERUSER_EMAIL")
password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")

if username and password:
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username, email, password)
        print("Superusuario creado")
    else:
        print("El superusuario ya existe")
END

echo "Iniciando servidor..."
gunicorn cancha.asgi:application -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --workers 1 --timeout 120
