from django.core.management.base import BaseCommand
from bookings.utils.cleanup import cancel_expired_bookings

class Command(BaseCommand):
    help = 'Cancela las reservas que han estado en estado pendiente por más de 5 minutos'

    def handle(self, *args, **options):
        self.stdout.write('Iniciando limpieza de reservas expiradas...')
        count = cancel_expired_bookings()
        if count > 0:
            self.stdout.write(self.style.SUCCESS(f'Se han cancelado {count} reservas expiradas.'))
        else:
            self.stdout.write('No se encontraron reservas expiradas para cancelar.')
