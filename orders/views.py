# orders/views.py
from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from users.permissions import IsRepOrAdmin
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Sum, Count
from products.models import Product
from .models import Order, OrderItem, OrderStatusHistory, ActivityLog
from .serializers import (
    OrderListSerializer, OrderDetailSerializer, 
    OrderCreateSerializer, OrderStatusHistorySerializer
)


class OrderListView(generics.ListAPIView):
    """List user's orders"""
    serializer_class = OrderListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'status', 'total_price']
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class OrderDetailView(generics.RetrieveAPIView):
    """Get order details"""
    serializer_class = OrderDetailSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'order_number'
    lookup_url_kwarg = 'number'
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class OrderCreateView(APIView):
    """Create new order from cart"""
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        from products.models import Cart
        
        # Get user's cart items
        cart_items = Cart.objects.filter(user=request.user).select_related('product')
        
        if not cart_items.exists():
            return Response(
                {'error': 'Cart is empty'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate totals
        subtotal = sum(item.subtotal for item in cart_items)
        delivery_fee = 0  # Free pickup for now
        discount = 0
        
        # Create order
        with transaction.atomic():
            order = Order.objects.create(
                user=request.user,
                delivery_name=request.data.get('delivery_name', ''),
                delivery_phone=request.data.get('delivery_phone', ''),
                delivery_address=request.data.get('delivery_address', ''),
                pickup_slot=request.data.get('pickup_slot', ''),
                notes=request.data.get('notes', ''),
                subtotal=subtotal,
                delivery_fee=delivery_fee,
                discount=discount,
                total_price=subtotal + delivery_fee - discount,
            )
            
            # Create order items
            for item in cart_items:
                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    product_name=item.product.name,
                    product_price=item.product.price,
                    quantity=item.quantity,
                )
            
            # Clear cart
            cart_items.delete()
        
        return Response(
            OrderDetailSerializer(order).data,
            status=status.HTTP_201_CREATED
        )


class OrderCancelView(APIView):
    """Cancel order"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, number):
        order = get_object_or_404(Order, order_number=number, user=request.user)
        
        if not order.is_cancellable:
            return Response(
                {'error': 'Order cannot be cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = Order.Status.CANCELLED
        order.save()
        
        OrderStatusHistory.objects.create(
            order=order,
            status=Order.Status.CANCELLED,
            note='Cancelled by customer',
            changed_by=request.user
        )
        
        return Response({'message': 'Order cancelled'})


# Market Rep Views
class RepOrderListView(generics.ListAPIView):
    """List all orders (for rep)"""
    serializer_class = OrderListSerializer
    permission_classes = [IsRepOrAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['order_number', 'delivery_name', 'delivery_phone']
    ordering_fields = ['created_at', 'status', 'total_price']
    
    def get_queryset(self):
        qs = Order.objects.all()
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        
        # Filter by branch
        branch = self.request.query_params.get('branch')
        if branch:
            qs = qs.filter(branch__slug=branch)
        
        return qs.select_related('user', 'branch')


class RepOrderDetailView(generics.RetrieveAPIView):
    """Get order details (for rep)"""
    serializer_class = OrderDetailSerializer
    permission_classes = [IsRepOrAdmin]
    lookup_field = 'order_number'
    lookup_url_kwarg = 'number'
    
    def get_queryset(self):
        return Order.objects.all()


class RepOrderStatusUpdateView(APIView):
    """Update order status (for rep)"""
    permission_classes = [IsRepOrAdmin]
    
    def post(self, request, number):
        order = get_object_or_404(Order, order_number=number)
        new_status = request.data.get('status')
        note = request.data.get('note', '')
        
        if new_status not in Order.Status.values:
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_status = order.status
        order.status = new_status
        order.save()
        
        # Create status history
        OrderStatusHistory.objects.create(
            order=order,
            status=new_status,
            note=note,
            changed_by=request.user
        )
        
        # Log activity
        ActivityLog.objects.create(
            order=order,
            action=ActivityLog.Action.STATUS_CHANGED,
            description=f'Status changed from {old_status} to {new_status}',
            user=request.user
        )
        
        return Response({'message': 'Order status updated'})


# Dashboard Stats
class RepDashboardStatsView(APIView):
    """Get dashboard statistics"""
    permission_classes = [IsRepOrAdmin]
    
    def get(self, request):
        from django.utils import timezone
        from datetime import timedelta
        
        today = timezone.now().date()
        
        # Orders today
        orders_today = Order.objects.filter(created_at__date=today)
        orders_count = orders_today.count()
        revenue_today = orders_today.filter(payment_status='paid').aggregate(Sum('total_price'))['total_price__sum'] or 0
        
        # Pending orders
        pending = Order.objects.filter(status='pending').count()
        
        # Orders by status
        by_status = Order.objects.values('status').annotate(count=Count('id'))
        
        return Response({
            'orders_today': orders_count,
            'revenue_today': revenue_today,
            'pending_orders': pending,
            'by_status': list(by_status),
        })