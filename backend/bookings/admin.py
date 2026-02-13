from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'court', 'start_time', 'end_time', 'status', 'created_at')
    list_filter = ('status', 'court', 'start_time')
    search_fields = ('user__username', 'user__email', 'court__name')
    date_hierarchy = 'start_time'
    ordering = ('-start_time',)
