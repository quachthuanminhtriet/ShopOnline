from rest_framework import pagination


class ProductPaginator(pagination.PageNumberPagination):
    page_size = 12


class OrderItemPaginator(pagination.PageNumberPagination):
    page_size = 5
