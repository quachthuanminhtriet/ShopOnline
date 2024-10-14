import random
from datetime import datetime

from django.contrib import admin
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.template.response import TemplateResponse
from django.urls import path, reverse
from django.utils.html import format_html

from . import utils
from .email import change_order_status

from .models import User, Customer, Category, Product, ImageProduct, Order, Brand, ImageBanner, \
    OrderItem, Review


@admin.action(description="Confirm return for selected orders")
def confirm_return(modeladmin, request, queryset):
    for order in queryset:
        if order.status == 'pending-2':
            change_order_status(
                order, 'returned',
                staff_message="Đơn hàng đã được shop xác nhận hoàn trả.",
                user_message=f"Đơn hàng #{order.id} của bạn đã được xác nhận hoàn trả và đang được gửi đến shipper."
            )
            modeladmin.message_user(request, f"Order #{order.id} has been confirmed for return.")
        else:
            modeladmin.message_user(request,
                                    f"Cannot confirm return for Order #{order.id}. It is not in 'pending-2' status.",
                                    level="error")


class OrderAdmin(admin.ModelAdmin):
    list_display = ('customer_id', 'total_price', 'status', 'status_payment', 'create_date', 'update_date')
    list_filter = ('status', 'status_payment', 'create_date')
    search_fields = ('customer_id__username', 'status', 'total_price')
    actions = [confirm_return]


class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'is_active', 'date_joined')
    list_filter = ('role', 'is_active', 'date_joined')
    search_fields = ('username', 'email')


class CustomerAdmin(admin.ModelAdmin):
    list_display = ('user', 'number_phone', 'birthday', 'address', 'create_date')
    search_fields = ('user__username', 'number_phone', 'address')


class ProductAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'price', 'size', 'stock', 'brand', 'cate_id')
    list_filter = ('brand', 'cate_id', 'price', 'stock')
    search_fields = ('code', 'name', 'brand__name', 'cate_id__name')


class ShopAppAdminSite(admin.AdminSite):
    site_header = "HỆ THỐNG QUẢN LÝ BÁN HÀNG ĐIỆN TỬ ONLINE"
    site_title = "Quản Trị Hệ Thống"
    index_title = "Chào Mừng Đến Với Quản Trị"

    def get_urls(self):
        custom_urls = [
            path('order-stats/', self.order_stats_view, name='order_stats'),
            path('send-email/', self.send_email_view, name='send_email'),
        ]
        return custom_urls + super().get_urls()

    def order_stats_view(self, request):
        year = self.get_year_from_request(request)
        stats = utils.get_order_stats_by_year(year=year)
        current_year = datetime.now().year
        return TemplateResponse(request, 'admin/order_stats.html', {
            "stats": stats,
            "year": year,
            "current_year": current_year,
        })

    def send_email_view(self, request):
        year = self.get_year_from_request(request)
        stats = utils.get_order_stats_by_year(year=year)
        email_content = render_to_string('admin/email_stats.html', {
            'stats': stats,
            'year': year,
        })

        email = EmailMessage(
            subject=f'Thống Kê Bán Hàng Năm {year}',
            body=email_content,
            from_email='triet123az@gmail.com',
            to=['triet123az@gmail.com'],
        )
        email.content_subtype = 'html'
        email.send()

        return self.order_stats_view(request)

    def get_year_from_request(self, request):
        year = request.GET.get('year')
        return int(year) if year else datetime.now().year


admin_site = ShopAppAdminSite(name='ShopAppAdmin')

admin_site.register(User, UserAdmin)
admin_site.register(Customer, CustomerAdmin)
admin_site.register(Category)
admin_site.register(Product, ProductAdmin)
admin_site.register(ImageProduct)
admin_site.register(Order, OrderAdmin)
admin_site.register(OrderItem)
admin_site.register(Brand)
admin_site.register(ImageBanner)
admin_site.register(Review)
