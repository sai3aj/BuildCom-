from django.contrib import admin
from django.utils.html import format_html
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
    list_display = ('name', 'category', 'display_price', 'stock')
    list_filter = ('category',)
    search_fields = ('name', 'description')

    def display_price(self, obj):
        return f'₹{obj.price}'
    display_price.short_description = 'Price'

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'customer_details', 'order_items', 'display_total', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('order_number', 'user_email', 'full_name', 'phone')
    readonly_fields = ('order_number', 'user_id', 'user_email', 'display_total', 'created_at', 'updated_at')
    inlines = [OrderItemInline]
    ordering = ('-created_at',)
    list_editable = ('status',)

    def display_total(self, obj):
        return f'₹{obj.total_amount}'
    display_total.short_description = 'Total Amount'

    def customer_details(self, obj):
        return format_html(
            '<div style="min-width: 200px;">'
            '<strong>{}</strong><br>'
            '<small>📧 {}<br>📱 {}<br>📍 {}</small>'
            '</div>',
            obj.full_name,
            obj.user_email,
            obj.phone,
            obj.address[:50] + '...' if obj.address and len(obj.address) > 50 else obj.address or '-'
        )
    customer_details.short_description = 'Customer Details'

    def order_items(self, obj):
        items = obj.items.all()
        if not items:
            return '-'
        
        items_html = ['<div style="min-width: 300px;">']
        for item in items:
            items_html.append(
                f'<div style="margin-bottom: 4px;">'
                f'• <strong>{item.product_name}</strong> '
                f'(x{item.quantity}) - ₹{item.subtotal}'
                f'</div>'
            )
        items_html.append('</div>')
        return format_html(''.join(items_html))
    order_items.short_description = 'Products'

    fieldsets = (
        ('Order Information', {
            'fields': ('order_number', 'status', 'display_total', 'payment_method')
        }),
        ('Customer Information', {
            'fields': ('user_id', 'user_email', 'full_name', 'phone', 'address')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def save_model(self, request, obj, form, change):
        if change and 'status' in form.changed_data:
            obj.save()
        else:
            super().save_model(request, obj, form, change)

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_email', 'session_id', 'display_total', 'created_at')
    search_fields = ('user_email', 'session_id')
    readonly_fields = ('display_total',)

    def display_total(self, obj):
        return f'₹{obj.total}'
    display_total.short_description = 'Total'

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 1

    def get_readonly_fields(self, request, obj=None):
        if obj:  # Editing an existing object
            return ('subtotal',)
        return ()
