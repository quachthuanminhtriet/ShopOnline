from django.contrib import admin
from .models import User, Customer, Category, Product, ImageProduct, Order, Brand, ImageBanner, \
    OrderItem


class CourseAppAdminSite(admin.AdminSite):
    site_header = "HỆ THỐNG QUẢN LÝ BÁN HÀNG ĐIỆN TỬ ONLINE"


admin_site = CourseAppAdminSite(name='MyApp')

admin_site.register(User)
admin_site.register(Customer)
admin_site.register(Category)
admin_site.register(Product)
admin_site.register(ImageProduct)
admin_site.register(Order)
admin_site.register(OrderItem)
admin_site.register(Brand)
admin_site.register(ImageBanner)

