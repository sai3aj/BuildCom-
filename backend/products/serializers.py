from rest_framework import serializers
from .models import Category, Product, Cart, CartItem, Order, OrderItem, ProductImage

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'image_url']
    
    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None

class ProductSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    product_images = ProductImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = '__all__'

    def get_image(self, obj):
        if obj.image:
            return obj.image.url
        return None

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer()
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'subtotal']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'session_id', 'user_id', 'user_email', 'items', 'total']

class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'product_price', 'quantity', 'subtotal']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user_id', 'user_email', 'full_name',
            'phone', 'address', 'total_amount', 'status', 'items',
            'created_at', 'updated_at'
        ] 