from django.contrib import admin
from .models import Plan

@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'price', 'duration', 'discount_percentage', 'auto_renew')
    list_filter = ('auto_renew',)
    search_fields = ('name', 'description')
