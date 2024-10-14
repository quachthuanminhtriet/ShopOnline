from django.db.models import Count, Sum
from .models import Order, OrderItem


def get_order_stats_by_year(year):
    order_stats = Order.objects.filter(create_date__year=year) \
        .values('create_date__month') \
        .annotate(
        total_orders=Count('id'),
        total_revenue=Sum('total_price')
    ).order_by('create_date__month')

    return order_stats
