from rest_framework import viewsets, generics, parsers, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from . import serializers, paginators
from .models import User, Customer, Category, Product, ImageProduct, ColorProduct, Review, Order, OrderItem
from .serializers import ProductSerializer


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.ListAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer

    def get_permissions(self):
        if self.action in ['get_current_user']:
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]

    @action(methods=['get', 'patch'], url_path='current-user', detail=False)
    def get_current_user(self, request):
        user = request.user

        if request.method.__eq__("patch"):
            for k, v in request.data.items():
                setattr(user, k, v)
                user.save()

        return Response(serializers.UserSerializer(user).data)


class CustomerViewSet(viewsets.ViewSet, generics.ListAPIView, generics.UpdateAPIView, generics.CreateAPIView):
    queryset = Customer.objects.filter(active=True)
    serializer_class = serializers.CustomerSerializer

    def get_queryset(self):
        queryset = self.queryset

        if self.action.__eq__('list'):
            q = self.request.query_params.get('q')
            if q:
                queryset = queryset.filter(code__icontains=q)

        return queryset


class CategoryViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    queryset = Category.objects.filter(active=True)
    serializer_class = serializers.CategorySerializer


class ProductViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    queryset = Product.objects.filter(active=True)
    serializer_class = serializers.ProductSerializer
    pagination_class = paginators.ProductPaginator

    def get_queryset(self):
        queryset = self.queryset

        if self.action.__eq__('list'):
            q = self.request.query_params.get('q')
            if q:
                queryset = queryset.filter(name__icontains=q)

            cate_id = self.request.query_params.get('cate_id')
            if cate_id:
                queryset = queryset.filter(cate_id=cate_id)

            min_price = self.request.query_params.get('min_price')
            max_price = self.request.query_params.get('max_price')

            if min_price:
                queryset = queryset.filter(price__gte=int(min_price))
            elif max_price:
                queryset = queryset.filter(price__lte=int(max_price))
            elif min_price and max_price:
                queryset = queryset.filter(price__range=(int(min_price), int(max_price)))

        return queryset

    @action(methods=['patch'], url_path='update_price', detail=True)
    def update_price(self, request, pk):
        product = self.get_object()
        product.price = request.data.get('price', product.price)
        product.save()

        return Response(serializers.ProductSerializer(product).data)


class ImageProductViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    queryset = ImageProduct.objects.filter(active=True)
    serializer_class = serializers.ImageProductSerializer


class ColorProductViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    queryset = ColorProduct.objects.filter(active=True)
    serializer_class = serializers.ColorProductSerializer


class ReviewViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView, generics.UpdateAPIView):
    queryset = Review.objects.filter(active=True)
    serializer_class = serializers.ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]


class OrderViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView, generics.UpdateAPIView):
    queryset = Order.objects.filter(active=True)
    serializer_class = serializers.OrderSerializer
    permission_classes = [permissions.IsAuthenticated]


class OrderItemViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView, generics.UpdateAPIView):
    queryset = OrderItem.objects.filter(active=True)
    serializer_class = serializers.OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    paginator_class = paginators.OrderItemPaginator
