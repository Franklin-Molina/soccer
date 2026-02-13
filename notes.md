git branch
git merge feature/vite-migration

git add .
git commit -m 
git push
-------------------------------------
git checkout feature/vite-migration  -> cambiar de rama

-------------------------------------
admin global
admingod:123456
-------------------------------------
-------------------------------------
-------------------------------------
-------------------------------------
-------------------------------------
-------------------------------------


from django.contrib.auth import get_user_model
User = get_user_model()
try:
    user = User.objects.get(username='test') # Buscar usuarios
    print("Usuario encontrado:", user.username)
except User.DoesNotExist:
    print("Error: Usuario no encontrado.")
    user = None



from django.contrib.auth import get_user_model
User = get_user_model()
admin_user = User.objects.create_superuser('admin', 'admin@admin.com', 'admin123')



write to file 
replace file


-----------
Todo web
python manage.py runserver 192.168.100.10:8000
npm run dev -- --host


ESTADISTICAS DE USURIOS NUEVOS

El sistema compara la cantidad de __usuarios nuevos de los últimos 30 días__ con la cantidad de __usuarios nuevos del período anterior__ (es decir, de hace 31 a 60 días).

La lógica es la siguiente:

1. __Calcula los nuevos usuarios del mes actual:__ Cuenta cuántos usuarios se registraron en los últimos 30 días.

2. __Calcula los nuevos usuarios del mes anterior:__ Cuenta cuántos usuarios se registraron en el período de 30 días justo anterior a este.

3. __Compara ambos períodos:__

   - Si en los últimos 30 días se registraron __más__ usuarios que en el período anterior, el porcentaje es __positivo__ (crecimiento).
   - Si se registraron __menos__ usuarios, el porcentaje es __negativo__ (decrecimiento).

__Por ejemplo:__

- Si en los últimos 30 días hubo __15__ nuevos usuarios.
- Y en los 30 días anteriores hubo __10__ nuevos usuarios.
- El sistema mostrará un __crecimiento del 50%__.
