from rest_framework import pagination


class ProductPaginator(pagination.PageNumberPagination):
    page_size = 9


class OrderItemPaginator(pagination.PageNumberPagination):
    page_size = 5


class ReviewPaginator(pagination.PageNumberPagination):
    page_size = 5
