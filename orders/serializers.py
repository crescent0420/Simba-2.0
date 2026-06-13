# orders/serializers.py
from rest_framework import serializers
from .models import Order, OrderItem, OrderStatusHistory
from users.serializers import UserSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(read_only=True)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_price', 'quantity', 'discount', 'subtotal']


class OrderListSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    item_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'status_display', 'payment_status', 'payment_status_display',
            'subtotal', 'delivery_fee', 'discount', 'total_price', 'payment_method',
            'item_count', 'created_at', 'updated_at'
        ]
    
    def get_item_count(self, obj):
        return obj.items.count()


class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_history = serializers.SerializerMethodField()
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user', 'status', 'payment_status',
            'delivery_name', 'delivery_phone', 'delivery_address', 'pickup_slot',
            'subtotal', 'delivery_fee', 'discount', 'total_price',
            'payment_method', 'payment_reference', 'paid_at',
            'notes', 'created_at', 'updated_at',
            'items', 'status_history'
        ]
    
    def get_status_history(self, obj):
        history = OrderStatusHistory.objects.filter(order=obj)[:10]
        from orders.serializers import OrderStatusHistorySerializer
        return OrderStatusHistorySerializer(history, many=True).data


class OrderCreateSerializer(serializers.Serializer):
    branch_id = serializers.IntegerField(required=False)
    delivery_name = serializers.CharField(max_length=200)
    delivery_phone = serializers.CharField(max_length=20)
    delivery_address = serializers.CharField(required=False, allow_blank=True)
    pickup_slot = serializers.CharField(required=False, allow_blank=True)
    items = serializers.ListField()
    notes = serializers.CharField(required=False, allow_blank=True)


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.get_full_name', read_only=True)
    
    class Meta:
        model = OrderStatusHistory
        fields = ['id', 'status', 'note', 'changed_by_name', 'created_at']