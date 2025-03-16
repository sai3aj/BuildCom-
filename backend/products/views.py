from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view
from django.middleware.csrf import get_token
from django.http import JsonResponse
from .models import Product, Category, Cart, CartItem, Order, OrderItem
from .serializers import (ProductSerializer, CategorySerializer, CartSerializer, 
                        CartItemSerializer, OrderSerializer)
import uuid
from datetime import datetime

# Create your views here.

@api_view(['GET'])
def csrf(request):
    return JsonResponse({'csrfToken': get_token(request)})

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    @action(detail=False, methods=['GET'])
    def by_category(self, request):
        category_id = request.query_params.get('category_id', None)
        if category_id:
            products = Product.objects.filter(category_id=category_id)
            serializer = self.get_serializer(products, many=True)
            return Response(serializer.data)
        return Response({'error': 'Category ID is required'}, status=400)

    @action(detail=False, methods=['GET'])
    def in_stock(self, request):
        products = Product.objects.filter(stock__gt=0)
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer

    def get_or_create_cart(self, session_id):
        if not session_id:
            session_id = str(uuid.uuid4())
        cart, created = Cart.objects.get_or_create(session_id=session_id)
        return cart, session_id

    def list(self, request):
        session_id = request.COOKIES.get('cart_session_id')
        cart, new_session_id = self.get_or_create_cart(session_id)
        serializer = self.get_serializer(cart)
        response = Response(serializer.data)
        if not session_id:
            response.set_cookie('cart_session_id', new_session_id)
        return response

    @action(detail=False, methods=['POST'])
    def add_item(self, request):
        session_id = request.COOKIES.get('cart_session_id')
        cart, new_session_id = self.get_or_create_cart(session_id)
        
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        
        if not product_id:
            return Response({'error': 'Product ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        product = get_object_or_404(Product, id=product_id)
        
        if product.stock < quantity:
            return Response({'error': 'Not enough stock'}, status=status.HTTP_400_BAD_REQUEST)
            
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
            
        serializer = CartSerializer(cart)
        response = Response(serializer.data)
        if not session_id:
            response.set_cookie('cart_session_id', new_session_id)
        return response

    @action(detail=False, methods=['POST'])
    def update_item(self, request):
        session_id = request.COOKIES.get('cart_session_id')
        if not session_id:
            return Response({'error': 'No cart found'}, status=status.HTTP_404_NOT_FOUND)
            
        cart = get_object_or_404(Cart, session_id=session_id)
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 0))
        
        if not product_id:
            return Response({'error': 'Product ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            cart_item = CartItem.objects.get(cart=cart, product_id=product_id)
            if quantity > 0:
                if cart_item.product.stock < quantity:
                    return Response({'error': 'Not enough stock'}, status=status.HTTP_400_BAD_REQUEST)
                cart_item.quantity = quantity
                cart_item.save()
            else:
                cart_item.delete()
        except CartItem.DoesNotExist:
            return Response({'error': 'Item not found in cart'}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['POST'])
    def place_order(self, request):
        session_id = request.COOKIES.get('cart_session_id')
        if not session_id:
            return Response({'error': 'No cart found'}, status=status.HTTP_404_NOT_FOUND)

        cart = get_object_or_404(Cart, session_id=session_id)
        if not cart.items.exists():
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate shipping information
        full_name = request.data.get('full_name')
        phone = request.data.get('phone')
        address = request.data.get('address')

        if not all([full_name, phone, address]):
            return Response({'error': 'Shipping information is incomplete'}, 
                          status=status.HTTP_400_BAD_REQUEST)

        # Create order
        order = Order.objects.create(
            order_number=f"ORD-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}",
            full_name=full_name,
            phone=phone,
            address=address,
            total_amount=cart.total
        )

        # Create order items and update stock
        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                product_name=cart_item.product.name,
                product_price=cart_item.product.price,
                quantity=cart_item.quantity
            )
            # Update product stock
            product = cart_item.product
            product.stock -= cart_item.quantity
            product.save()

        # Clear the cart
        cart.items.all().delete()

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['POST'])
    def clear(self, request):
        session_id = request.COOKIES.get('cart_session_id')
        if not session_id:
            return Response({'error': 'No cart found'}, status=status.HTTP_404_NOT_FOUND)
            
        cart = get_object_or_404(Cart, session_id=session_id)
        cart.items.all().delete()
        serializer = CartSerializer(cart)
        return Response(serializer.data)
