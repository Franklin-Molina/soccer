import django_filters
from .models import Court

class CourtFilter(django_filters.FilterSet):
    characteristics = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = Court
        fields = ['characteristics']
