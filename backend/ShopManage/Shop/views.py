from rest_framework import viewsets, generics, parsers, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from . import serializers, paginators
from .email import send_confirmation_email
from .models import User, Customer, Category, Product, ImageProduct, Review, Order, Brand, \
    ImageBanner, OrderItem


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

    def get_queryset(self):
        queryset = self.queryset

        if self.action.__eq__('list'):
            q = self.request.query_params.get('q')
            if q:
                queryset = queryset.filter(name__icontains=q)

            cate_id = self.request.query_params.get('cate_id')
            if cate_id:
                queryset = queryset.filter(cate_id=cate_id)

            brand = self.request.query_params.get('brand')
            if brand:
                queryset = queryset.filter(brand=brand)

        return queryset

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class ImageProductViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    queryset = ImageProduct.objects.filter(active=True)
    serializer_class = serializers.ImageProductSerializer

    def get_queryset(self):
        queryset = self.queryset

        if self.action.__eq__('list'):
            pro_id = self.request.query_params.get('product')
            if pro_id:
                queryset = queryset.filter(product=pro_id)

        return queryset


class ReviewViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView, generics.UpdateAPIView):
    queryset = Review.objects.filter(active=True)
    serializer_class = serializers.ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]


class OrderViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView, generics.UpdateAPIView,
                   generics.DestroyAPIView):
    queryset = Order.objects.filter(active=True)
    serializer_class = serializers.OrderSerializer

    # permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = self.queryset
        if self.action.__eq__('list'):
            customer_id = self.request.query_params.get('customer_id')
            status = self.request.query_params.get('status')
            if customer_id:
                queryset = queryset.filter(customer_id=customer_id)
            if status:
                queryset = queryset.filter(status=status)

        return queryset


class OrderItemViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView, generics.UpdateAPIView):
    queryset = OrderItem.objects.filter(active=True)
    serializer_class = serializers.OrderItemSerializer
    # permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = self.queryset
        if self.action.__eq__('list'):
            order_id = self.request.query_params.get('order_id')
            if order_id:
                queryset = queryset.filter(order_id=order_id)

        return queryset


class BrandViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    queryset = Brand.objects.filter(active=True)
    serializer_class = serializers.BranchSerializer


# class VoucherViewSet(viewsets.ViewSet, generics.ListAPIView):
#     queryset = Voucher.objects.filter(active=True)
#     serializer_class = serializers.VoucherSerializer

class ImageBannerViewSet(viewsets.ModelViewSet, generics.ListAPIView):
    queryset = ImageBanner.objects.filter(active=True)
    serializer_class = serializers.ImageBannerSerializer
