from django.contrib import admin
from .models import Court, CourtImage

class CourtImageInline(admin.TabularInline):
    model = CourtImage
    extra = 1

@admin.register(Court)
class CourtAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'price', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name',)
    inlines = [CourtImageInline]

@admin.register(CourtImage)
class CourtImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'court', 'image_url')
