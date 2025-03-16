from django.contrib import admin
from .models import Product, Category, Order, OrderItem, Cart, CartItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    readonly_fields = ('product_name', 'product_price', 'quantity', 'subtotal')
    extra = 0
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'stock')
    list_filter = ('category',)
    search_fields = ('name', 'description')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'user_email', 'full_name', 'total_amount', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('order_number', 'user_email', 'full_name', 'phone')
    readonly_fields = ('order_number', 'user_id', 'user_email', 'total_amount', 'created_at', 'updated_at')
    inlines = [OrderItemInline]
    ordering = ('-created_at',)
    list_editable = ('status',)

    fieldsets = (
        ('Order Information', {
            'fields': ('order_number', 'status', 'total_amount')
        }),
        ('User Information', {
            'fields': ('user_id', 'user_email', 'full_name', 'phone', 'address')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def save_model(self, request, obj, form, change):
        if change and 'status' in form.changed_data:
            # Status has been changed
            obj.save()
        else:
            super().save_model(request, obj, form, change)

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_email', 'session_id', 'total', 'created_at')
    search_fields = ('user_email', 'session_id')
    readonly_fields = ('total',)

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 1

    def get_readonly_fields(self, request, obj=None):
        if obj:  # Editing an existing object
            return ('subtotal',)
        return ()
