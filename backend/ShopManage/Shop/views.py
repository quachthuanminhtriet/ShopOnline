from django.contrib.auth.hashers import make_password
from rest_framework import viewsets, generics, parsers, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from . import serializers, paginators
from .email import send_confirmation_email, send_notification_to_staff, send_notification_to_user
from .models import User, Customer, Category, Product, ImageProduct, Review, Order, Brand, \
    ImageBanner, OrderItem


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.ListAPIView, generics.UpdateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save(password=make_password(serializer.validated_data['password']))
            customer = Customer(
                user=user,
                number_phone=request.data.get('number_phone'),
                birthday=request.data.get('birthday'),
                address=request.data.get('address')
            )
            customer.save()
            return Response(serializers.UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        user = self.get_object()
        user_serializer = self.get_serializer(user, data=request.data, partial=True)
        if user_serializer.is_valid():
            user = user_serializer.save()
            if hasattr(user, 'customer'):
                customer = user.customer  # Access the related Customer
                customer.number_phone = request.data.get('number_phone', customer.number_phone)
                customer.birthday = request.data.get('birthday', customer.birthday)
                customer.address = request.data.get('address', customer.address)
                customer.save()

            return Response(serializers.UserSerializer(user).data)

        return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_object(self):
        try:
            return User.objects.get(pk=self.kwargs['pk'], is_active=True)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    def get_permissions(self):
        if self.action in ['get_current_user', 'update_user']:
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
    permission_classes = [permissions.IsAuthenticated]


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

    def create(self, request, *args, **kwargs):
        order_items_data = request.data.get('items', [])
        total_price = 0

        # Kiểm tra số lượng hàng tồn kho cho từng sản phẩm
        for item_data in order_items_data:
            product_id = item_data.get('product_id')
            quantity = item_data.get('quantity')

            product = Product.objects.get(id=product_id)

            if product.stock < quantity:
                return Response({"error": f"Sản phẩm {product.name} không đủ hàng trong kho."},
                                status=status.HTTP_400_BAD_REQUEST)

            total_price += product.price * quantity

        # Tạo đơn hàng
        order = Order.objects.create(
            customer_id=request.user,
            total_price=total_price,
            status='pending',
            status_payment='not-yet'
        )

        # Tạo OrderItem và cập nhật số lượng hàng tồn kho
        for item_data in order_items_data:
            product_id = item_data.get('product_id')
            quantity = item_data.get('quantity')
            product = Product.objects.get(id=product_id)

            OrderItem.objects.create(order_id=order, product_id=product, quantity=quantity)

            # Cập nhật số lượng hàng tồn kho
            product.stock -= quantity
            product.save()

        return Response(serializers.OrderSerializer(order).data, status=status.HTTP_201_CREATED)

    @action(methods=['patch'], detail=True)
    def cancel_order(self, request, pk=None):
        order = self.get_object()
        if order.status == 'processing':
            order.status = 'pending-2'
            order.save()
            user_email = order.customer_id.email
            send_notification_to_staff(order.id, "Người dùng đã yêu cầu hủy đơn hàng.", user_email)

            return Response({"status": "Order is now pending confirmation. Notification sent to staff."})
        return Response({"error": "Cannot cancel this order."}, status=400)

    @action(methods=['patch'], detail=True)
    def return_order(self, request, pk=None):
        order = self.get_object()
        if order.status == 'delivered':
            order.status = 'pending-2'
            order.save()
            user_email = order.customer_id.email
            send_notification_to_staff(order.id, "Người dùng đã yêu cầu hoàn trả đơn hàng.", user_email)

            return Response({"status": "Order is now pending confirmation. Notification sent to staff."})
        return Response({"error": "Cannot return this order."}, status=400)

    @action(methods=['patch'], detail=True, url_path='confirm-return')
    def confirm_return(self, request, pk=None):
        order = self.get_object()
        if order.status == 'pending-2':
            order.status = 'returned'
            order.save()
            user_email = order.customer_id.email
            send_notification_to_staff(order.id, "Đơn hàng đã được shop xác nhận hoàn trả.", user_email)
            send_notification_to_user(user_email,
                                      f"Đơn hàng #{order.id} của bạn đã được xác nhận hoàn trả và đang được gửi đến shipper.",
                                      order.id)
            return Response({"status": "Order has been confirmed for return. Notification sent to staff and user."})
        return Response({"error": "Cannot confirm return for this order."}, status=400)


class OrderItemViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView, generics.UpdateAPIView):
    queryset = OrderItem.objects.filter(active=True)
    serializer_class = serializers.OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]

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
