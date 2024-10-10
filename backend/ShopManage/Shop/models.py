import code

from cloudinary import CloudinaryImage
from cloudinary.models import CloudinaryField
from django.contrib.auth.models import AbstractUser
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import Sum


class BaseModel(models.Model):
    create_date = models.DateField(auto_now_add=True, null=True)
    update_date = models.DateField(auto_now=True, null=True)
    active = models.BooleanField(default=True)

    class Meta:
        abstract = True


class User(AbstractUser):
    avatar = CloudinaryField(null=True)

    ROLE_CHOICES = [
        ('admin', 'Quản Trị Viên'),
        ('customer', 'Khách Hàng'),
    ]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='customer')

    class Meta:
        verbose_name_plural = 'Tài Khoản Người Dùng'

    def __str__(self):
        return self.username


class Customer(BaseModel):
    number_phone = models.CharField(max_length=12, null=True, blank=True)
    birthday = models.DateField()
    address = models.CharField(max_length=100)
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)

    class Meta:
        verbose_name_plural = 'Khách Hàng'

    def __str__(self):
        return f"{self.user.last_name} {self.user.first_name}"


class Category(BaseModel):
    code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=255)

    class Meta:
        verbose_name_plural = 'Danh Mục'

    def __str__(self):
        return self.name


class Brand(BaseModel):
    code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=255)

    class Meta:
        verbose_name_plural = 'Thương Hiệu'

    def __str__(self):
        return self.name


class Product(BaseModel):
    code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=255)
    price = models.IntegerField(validators=[MinValueValidator(0)])  # Giá không âm
    cate_id = models.ForeignKey(Category, on_delete=models.PROTECT)
    size = models.IntegerField(validators=[MinValueValidator(1)])  # Kích thước phải dương
    stock = models.IntegerField(validators=[MinValueValidator(0)])  # Kho không âm
    brand = models.ForeignKey(Brand, on_delete=models.PROTECT)

    class Meta:
        verbose_name_plural = 'Sản Phẩm'

    def __str__(self):
        return self.code


class ImageProduct(BaseModel):
    image = CloudinaryField(null=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')

    class Meta:
        verbose_name_plural = 'Hình Ảnh Sản Phẩm'

    def __str__(self):
        return f"{self.product.code} - {self.id}"


class Review(BaseModel):
    product_id = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='products')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='users')
    content = models.TextField()
    rating = models.IntegerField(default=5, validators=[MaxValueValidator(5), MinValueValidator(1)])

    class Meta:
        verbose_name_plural = 'Đánh giá sản phẩm'

    def __str__(self):
        return f"{self.product_id.code} - {self.user.first_name} - {self.content}"


class Order(BaseModel):
    customer_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    total_price = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=50, choices=[
        ('pending', 'Chờ xác nhận'),
        ('pending-2', 'Chờ xác nhận'),
        ('processing', 'Đang Xử Lý'),
        ('shipping', 'Đang Giao Hàng'),
        ('delivered', 'Đã Nhận'),
        ('cancelled', 'Đã Hủy'),
        ('returned', 'Hoàn Trả')
    ])
    status_payment = models.CharField(max_length=50, choices=[
        ('not-yet', 'Chưa thanh toán'),
        ('waiting', 'Chờ Thanh Toán'),
        ('paid', 'Đã thanh toán')
    ])

    @classmethod
    def get_revenue(cls, year, month):
        return cls.objects.filter(
            create_date__year=year,
            create_date__month=month
        ).aggregate(total_revenue=Sum('total_price'))['total_revenue'] or 0

    class Meta:
        verbose_name_plural = 'Đơn Hàng'

    def __str__(self):
        return f"{self.customer_id.username} - {self.total_price} - {self.status}"


class OrderItem(BaseModel):
    order_id = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product_id = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    selected_image = CloudinaryField(null=True)

    class Meta:
        verbose_name_plural = 'Sản phẩm đơn hàng'

    def __str__(self):
        return f"{self.order_id.id} - {self.product_id.code} - {self.quantity} - {self.selected_image}"


class ImageBanner(BaseModel):
    name = models.CharField(max_length=255)
    image = CloudinaryField(null=True)

    class Meta:
        verbose_name_plural = 'Hình ảnh minh hoạ'

    def __str__(self):
        return self.name
