from django.urls import path, include
from rest_framework import routers
from . import views


r = routers.DefaultRouter()
r.register('users', views.UserViewSet, 'users')
r.register('customers', views.CustomerViewSet, 'customers')
r.register('categories', views.CategoryViewSet, 'categories')
r.register('products', views.ProductViewSet, 'products')
r.register('images_product', views.ImageProductViewSet, 'images_product')
r.register('colors_product', views.ColorProductViewSet, 'colors_product')
r.register('reviews', views.ReviewViewSet, 'reviews')

urlpatterns = [
    path('', include(r.urls))
]