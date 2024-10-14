from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from .models import User, Customer, Category, Product, ImageProduct, Review, Order, OrderItem, Brand, \
    ImageBanner


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(required=False)

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if instance.avatar:
            rep['avatar'] = instance.avatar.url
        else:
            rep['avatar'] = None  # Or provide a default image URL
        return rep

    class Meta:
        model = User
        fields = '__all__'
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    main_image = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = '__all__'

    def get_main_image(self, obj):
        return obj.images.first().image.url if obj.images.exists() else None

    def get_images(self, obj):
        return [image.image.url for image in obj.images.all()]


class ImageProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageProduct
        fields = '__all__'

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if instance.image:
            rep['image'] = instance.image.url
        else:
            rep['image'] = None
        return rep


class ReviewSerializer(serializers.ModelSerializer):
    user_avatar = serializers.SerializerMethodField()
    user_first_name = serializers.CharField(source='user.first_name', read_only=True)

    class Meta:
        model = Review
        fields = '__all__'

    def get_user_avatar(self, obj):
        return obj.user.avatar.url if obj.user.avatar else None


class OrderSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = '__all__'

    def get_items(self, obj):
        return [
            {
                "id": item.id,  # ID của OrderItem
                "product_id": item.product_id.id,
                "product_name": item.product_id.name,
                "quantity": item.quantity,
                "price": item.product_id.price,
                "selected_image": item.selected_image.url if item.selected_image else None
            }
            for item in obj.items.all()
        ]


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = '__all__'

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if instance.selected_image:
            rep['selected_image'] = instance.selected_image.url
        else:
            rep['selected_image'] = None
        return rep


class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = '__all__'


class ImageBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageBanner
        fields = '__all__'

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if instance.image:
            rep['image'] = instance.image.url
        else:
            rep['image'] = None  # Or provide a default image URL
        return rep
