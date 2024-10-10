from datetime import datetime
from django.contrib import admin
from django import forms
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.template.response import TemplateResponse
from django.urls import path
from . import utils

from .models import User, Customer, Category, Product, ImageProduct, Order, Brand, ImageBanner, \
    OrderItem, Review


class RevenueReportForm(forms.Form):
    year = forms.IntegerField(label='Year', required=True)
    month = forms.ChoiceField(label='Month', choices=[
        (1, 'January'), (2, 'February'), (3, 'March'),
        (4, 'April'), (5, 'May'), (6, 'June'),
        (7, 'July'), (8, 'August'), (9, 'September'),
        (10, 'October'), (11, 'November'), (12, 'December')
    ])


class CourseAppAdminSite(admin.AdminSite):
    site_header = "HỆ THỐNG QUẢN LÝ BÁN HÀNG ĐIỆN TỬ ONLINE"
    site_title = "Quản Trị Hệ Thống"
    index_title = "Chào Mừng Đến Với Quản Trị"

    def get_urls(self):
        custom_urls = [
            path('order-stats/', self.order_stats_view, name='order_stats'),
            path('send-email/', self.send_email_view, name='send_email'),  # Add this line
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
admin_site.register(Review)
