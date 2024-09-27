import code

from cloudinary import CloudinaryImage
from cloudinary.models import CloudinaryField
from django.contrib.auth.models import AbstractUser
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class BaseModel(models.Model):
    create_date = models.DateField(auto_now_add=True, null=True)
    update_date = models.DateField(auto_now=True, null=True)
    active = models.BooleanField(default=True)

    class Meta:
        abstract = True


class User(AbstractUser):
    avatar = CloudinaryField(null=True)

    ROLE_CHOICES = {
        ('admin', 'Quản Trị Viên'),
        ('customer', 'Khách Hàng'),
        # ('staff', 'Nhân Viên'),
    }

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='customer')

    class Meta:
        verbose_name_plural = 'Tài Khoản Người Dùng'

    def __str__(self):
        return self.username


class Customer(BaseModel):
    full_name = models.CharField(max_length=50, null=False)
    birthday = models.DateField(null=False)
    address = models.CharField(max_length=100, null=False)
    email = models.EmailField(max_length=255, null=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)

    class Meta:
        verbose_name_plural = 'Khách Hàng'

    def __str__(self):
        return self.full_name


class Category(BaseModel):
    code = models.CharField(max_length=10, unique=True, null=False)
    name = models.CharField(max_length=255, null=False)

    class Meta:
        verbose_name_plural = 'Danh Mục'

    def __str__(self):
        return self.name


class Product(BaseModel):
    code = models.CharField(max_length=10, unique=True, null=False)
    name = models.CharField(max_length=255, null=False)
    price = models.IntegerField(null=False)
    cate_id = models.ForeignKey(Category, on_delete=models.PROTECT, null=False)
    color = models.CharField(max_length=55, null=False)
    size = models.IntegerField(null=False)
    stock = models.IntegerField(null=False)

    class Meta:
        verbose_name_plural = 'Sản Phẩm'

    def __str__(self):
        return self.code


class ImageProduct(BaseModel):
    image = CloudinaryField(null=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=False)

    class Meta:
        verbose_name_plural = 'Hình Ảnh Sản Phẩm'

    def __str__(self):
        return f"{self.product.code} - {self.image}"


class ColorProduct(BaseModel):
    color = models.CharField(max_length=55, null=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=False)

    class Meta:
        verbose_name_plural = 'Màu Sản Phẩm'

    def __str__(self):
        return f"{self.product.code} - {self.color}"


class Review(BaseModel):
    product_id = models.ForeignKey(Product, on_delete=models.CASCADE, null=False)
    customer_id = models.ForeignKey(Customer, on_delete=models.CASCADE, null=False)
    content = models.TextField(null=False)
    rating = models.IntegerField(null=False, default=5, validators=[MaxValueValidator(5), MinValueValidator(1)])

    class Meta:
        verbose_name_plural = 'Đánh giá sản phẩm'

    def __str__(self):
        return f"{self.product_id.code} - {self.customer_id.code} - {self.content}"


class Order(BaseModel):
    customer_id = models.ForeignKey(Customer, on_delete=models.CASCADE)
    total_quantity = models.IntegerField(null=True, blank=True)
    total_price = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=50, null=False,
                              choices=[('pending', 'Chờ xác nhận'),
                                       ('processing', 'Đang Xử Lý'),
                                       ('shipping', 'Đang Giao Hàng'),
                                       ('delivered', 'Đã Nhận'),
                                       ('cancelled', 'Đã Hủy')])

    class Meta:
        verbose_name_plural = 'Đơn Hàng'

    def __str__(self):
        return f"{self.customer_id.full_name} - {self.total_quantity} - {self.total_price} - {self.status}"


class OrderItem(BaseModel):
    order_id = models.ForeignKey(Order, on_delete=models.CASCADE)
    product_id = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(null=True, default=1)

    class Meta:
        verbose_name_plural = 'Sản phẩm đơn hàng'

    def __str__(self):
        return f"{self.order_id} - {self.product_id} - {self.quantity}"