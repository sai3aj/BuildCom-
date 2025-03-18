from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view
from django.middleware.csrf import get_token
from django.http import JsonResponse
from django.db.models import Q
from .models import Product, Category, Cart, CartItem, Order, OrderItem, ProductImage
from .serializers import (ProductSerializer, CategorySerializer, CartSerializer, 
                        CartItemSerializer, OrderSerializer, OrderItemSerializer, ProductImageSerializer)
import uuid
from datetime import datetime
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator

# Create your views here.

@api_view(['GET'])
@ensure_csrf_cookie
def csrf(request):
    token = get_token(request)
    return JsonResponse({'csrfToken': token})

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = Product.objects.all()
        search = self.request.query_params.get('search', None)
        category = self.request.query_params.get('category', None)
        
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search)
            )
            
        if category:
            queryset = queryset.filter(category=category)
            
        return queryset

    def create(self, request, *args, **kwargs):
        images = request.FILES.getlist('images')
        main_image = request.FILES.get('image')
        
        # Create product with main image
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        
        # Handle additional images
        for img in images:
            ProductImage.objects.create(product=product, image=img)
        
        # Return the updated product with all images
        updated_serializer = self.get_serializer(product)
        return Response(updated_serializer.data, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        images = request.FILES.getlist('images')
        
        # Update the main product
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Add any new additional images
        for img in images:
            ProductImage.objects.create(product=instance, image=img)
        
        # Return the updated product with all images
        updated_serializer = self.get_serializer(instance)
        return Response(updated_serializer.data)

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
        
    @action(detail=True, methods=['DELETE'])
    def remove_image(self, request, pk=None):
        image_id = request.query_params.get('image_id')
        if not image_id:
            return Response({'error': 'Image ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            product = self.get_object()
            image = ProductImage.objects.get(id=image_id, product=product)
            image.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProductImage.DoesNotExist:
            return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['GET'])
    def search(self, request):
        """
        Search for products by name or description.
        """
        search_query = request.query_params.get('q', '')
        if not search_query:
            return Response({'error': 'No search query provided'}, status=status.HTTP_400_BAD_REQUEST)
            
        products = self.get_queryset().filter(
            Q(name__icontains=search_query) | 
            Q(description__icontains=search_query)
        )
        
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

@method_decorator(ensure_csrf_cookie, name='dispatch')
class CartViewSet(viewsets.ViewSet):
    def get_cart(self, request):
        user_id = request.query_params.get('user_id') or request.data.get('user_id')
        session_id = request.session.get('cart_id')

        if user_id:
            # Try to find cart by user_id first
            cart = Cart.objects.filter(user_id=user_id).first()
            if cart:
                return cart

        if session_id:
            cart = Cart.objects.filter(session_id=session_id).first()
            if cart:
                # If user is now logged in, update the cart with user info
                if user_id and not cart.user_id:
                    cart.user_id = user_id
                    cart.save()
                return cart

        return None

    def list(self, request):
        cart = self.get_cart(request)
        if not cart:
            return Response({'items': []})
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        try:
            product_id = request.data.get('product_id')
            quantity = int(request.data.get('quantity', 1))
            user_id = request.data.get('user_id')
            user_email = request.data.get('user_email')

            if not product_id:
                return Response({'error': 'Product ID is required'}, status=status.HTTP_400_BAD_REQUEST)

            product = get_object_or_404(Product, id=product_id)
            
            cart = self.get_cart(request)
            if not cart:
                session_id = str(uuid.uuid4())
                request.session['cart_id'] = session_id
                cart = Cart.objects.create(
                    session_id=session_id,
                    user_id=user_id,
                    user_email=user_email
                )
            elif user_id and not cart.user_id:
                cart.user_id = user_id
                cart.user_email = user_email
                cart.save()

            cart_item, created = CartItem.objects.get_or_create(
                cart=cart,
                product=product,
                defaults={'quantity': quantity}
            )

            if not created:
                cart_item.quantity += quantity
                cart_item.save()

            serializer = CartSerializer(cart)
            return Response(serializer.data)
        except Exception as e:
            print(f"Error in add_item: {str(e)}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def update_item(self, request):
        item_id = request.data.get('item_id')
        quantity = request.data.get('quantity')
        user_id = request.data.get('user_id')

        if not item_id or quantity is None:
            return Response({'error': 'Item ID and quantity are required'}, status=status.HTTP_400_BAD_REQUEST)

        cart = self.get_cart(request)
        if not cart:
            return Response({'error': 'Cart not found'}, status=status.HTTP_404_NOT_FOUND)

        # Verify cart belongs to user
        if user_id and cart.user_id and cart.user_id != user_id:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
            if int(quantity) > 0:
                cart_item.quantity = int(quantity)
                cart_item.save()
            else:
                cart_item.delete()
        except CartItem.DoesNotExist:
            return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        item_id = request.data.get('item_id')
        user_id = request.data.get('user_id')
        
        if not item_id:
            return Response({'error': 'Item ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        cart = self.get_cart(request)
        if not cart:
            return Response({'error': 'Cart not found'}, status=status.HTTP_404_NOT_FOUND)

        # Verify cart belongs to user
        if user_id and cart.user_id and cart.user_id != user_id:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
            cart_item.delete()
        except CartItem.DoesNotExist:
            return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def clear(self, request):
        user_id = request.data.get('user_id')
        cart = self.get_cart(request)
        
        if cart:
            # Verify cart belongs to user
            if user_id and cart.user_id and cart.user_id != user_id:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            cart.items.all().delete()
            
        return Response({'message': 'Cart cleared'})

    @action(detail=False, methods=['post'])
    def place_order(self, request):
        cart = self.get_cart(request)
        if not cart or not cart.items.exists():
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate required fields
        required_fields = ['full_name', 'phone', 'address', 'user_id', 'user_email']
        for field in required_fields:
            if not request.data.get(field):
                return Response({'error': f'{field} is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Verify cart belongs to user
        user_id = request.data.get('user_id')
        if user_id and cart.user_id and cart.user_id != user_id:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            # Create order
            order = Order.objects.create(
                order_number=f"ORD-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}",
                user_id=request.data['user_id'],
                user_email=request.data['user_email'],
                full_name=request.data['full_name'],
                phone=request.data['phone'],
                address=request.data['address'],
                total_amount=cart.total
            )

            # Create order items
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

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    
    def get_queryset(self):
        user_id = self.request.query_params.get('user_id', None)
        if not user_id:
            return Order.objects.none()
        return Order.objects.filter(user_id=user_id).order_by('-created_at')
