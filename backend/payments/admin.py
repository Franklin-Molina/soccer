from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'booking', 'amount', 'status', 'method', 'payment_date')
    list_filter = ('status', 'method', 'payment_date')
    search_fields = ('user__username', 'user__email', 'transaction_id')
    readonly_fields = ('payment_date',)
    ordering = ('-payment_date',)
