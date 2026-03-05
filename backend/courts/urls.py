from django.urls import path
from . import views

urlpatterns = [
    # Court endpoints
    path('', views.CourtList.as_view(), name='court-list'),
    path('<int:pk>/', views.CourtDetail.as_view(), name='court-detail'),
    path('<int:court_id>/weekly-availability/', views.CourtWeeklyAvailabilityView.as_view(), name='court-weekly-availability'),
    path('availability/', views.CourtAvailabilityView.as_view(), name='court-availability'),
    
    # Category endpoints
    path('categories/', views.CategoryList.as_view(), name='category-list'),
    path('categories/<int:pk>/', views.CategoryDetail.as_view(), name='category-detail'),
]
