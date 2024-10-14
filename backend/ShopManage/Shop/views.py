from django.contrib.admin.templatetags.admin_list import pagination
from django.contrib.auth.hashers import make_password
from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from . import serializers
from .email import send_notification_to_staff, send_notification_to_user, send_payment_waiting_to_staff
from .models import User, Customer, Category, Product, ImageProduct, Review, Order, Brand, \
    ImageBanner, OrderItem
from .paginators import ProductPaginator, ReviewPaginator


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.ListAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer

    def get_permissions(self):
        if self.action in ['get_current_user', 'change_password']:
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]

    @action(methods=['patch'], url_path='change-password', detail=True)
    def change_password(self, request, pk=None):
        if str(request.user.id) != pk:
            return Response({"error": "Bạn không có quyền thay đổi mật khẩu của người khác."},
                            status=status.HTTP_403_FORBIDDEN)
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        if not user.check_password(current_password):
            return Response({"error": "Mật khẩu hiện tại không chính xác."}, status=status.HTTP_400_BAD_REQUEST)
        user.password = make_password(new_password)
        user.save()

        return Response({"message": "Mật khẩu đã được thay đổi thành công."}, status=status.HTTP_200_OK)

    @action(methods=['get', 'patch'], url_path='current-user', detail=False)
    def get_current_user(self, request):
        user = request.user

        if request.method.__eq__("patch"):
            for k, v in request.data.items():
                setattr(user, k, v)
                user.save()

        return Response(serializers.UserSerializer(user).data)

    def create(self, request, *args, **kwargs):
        print(request.data)
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


class CustomerViewSet(viewsets.ViewSet, generics.ListAPIView, generics.UpdateAPIView, generics.CreateAPIView):
    queryset = Customer.objects.filter(active=True)
    serializer_class = serializers.CustomerSerializer
    # permission_classes = [permissions.IsAuthenticated]


class CategoryViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    queryset = Category.objects.filter(active=True)
    serializer_class = serializers.CategorySerializer


class ProductViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    queryset = Product.objects.filter(active=True)
    serializer_class = serializers.ProductSerializer
    pagination_class = ProductPaginator

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

    # pagination_class = ReviewPaginator
    # permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = self.queryset
        if self.action.__eq__('list'):
            product_id = self.request.query_params.get('product_id')
            if product_id:
                queryset = queryset.filter(product_id=product_id)

        return queryset


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

    @action(methods=['patch'], detail=True)
    def cancel_order(self, request, pk=None):
        order = self.get_object()
        if order.status == 'processing':
            order.status = 'cancelled'
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

    @action(methods=['patch'], detail=True, url_path='update-payment-status')
    def update_payment_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')

        if new_status == 'waiting':
            order.status_payment = 'waiting'
            order.save()

            # Gửi thông báo email tới nhân viên
            customer_email = order.customer_id.email
            send_payment_waiting_to_staff(order.id, customer_email)

        return Response({"status": "Payment status updated to waiting."})

    def perform_create(self, serializer):
        order = serializer.save()
        if order.status_payment == 'waiting':
            customer_email = order.customer_id.email
            send_payment_waiting_to_staff(order.id, customer_email)


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
