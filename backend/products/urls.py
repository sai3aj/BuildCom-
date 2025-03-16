from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, CategoryViewSet, CartViewSet, csrf

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'cart', CartViewSet, basename='cart')

urlpatterns = [
    path('', include(router.urls)),
    path('csrf/', csrf, name='csrf'),
    path('cart/add_item/', CartViewSet.as_view({'post': 'add_item'}), name='cart-add-item'),
    path('cart/update_item/', CartViewSet.as_view({'post': 'update_item'}), name='cart-update-item'),
    path('cart/clear/', CartViewSet.as_view({'post': 'clear'}), name='cart-clear'),
    path('cart/place_order/', CartViewSet.as_view({'post': 'place_order'}), name='cart-place-order'),
] 