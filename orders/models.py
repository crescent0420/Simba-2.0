# orders/models.py
from django.db import models
from django.conf import settings
from users.models import Branch


class Order(models.Model):
    """Customer orders"""
    
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        CONFIRMED = 'confirmed', 'Confirmed'
        PROCESSING = 'processing', 'Processing'
        READY = 'ready', 'Ready for Pick-up'
        PICKED = 'picked', 'Picked Up'
        CANCELLED = 'cancelled', 'Cancelled'
    
    class PaymentStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PAID = 'paid', 'Paid'
        FAILED = 'failed', 'Failed'
        REFUNDED = 'refunded', 'Refunded'
    
    order_number = models.CharField(max_length=20, unique=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    
    # Delivery info
    delivery_name = models.CharField(max_length=200)
    delivery_phone = models.CharField(max_length=20)
    delivery_address = models.TextField(blank=True)
    pickup_slot = models.CharField(max_length=100, blank=True)  # e.g., "Mon 2-4PM"
    
    # Pricing
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Payment
    payment_method = models.CharField(max_length=50, default='MTN MoMo')
    payment_reference = models.CharField(max_length=100, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    
    notes = models.TextField(blank=True)
    internal_notes = models.TextField(blank=True)  # For staff only
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['branch', 'status']),
        ]
    
    def __str__(self):
        return f"Order #{self.order_number}"
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = self.generate_order_number()
        super().save(*args, **kwargs)
    
    def generate_order_number(self):
        import random
        import string
        prefix = 'SB'
        random_part = ''.join(random.choices(string.digits, k=6))
        return f"{prefix}{random_part}"
    
    @property
    def is_paid(self):
        return self.payment_status == self.PaymentStatus.PAID
    
    @property
    def is_cancellable(self):
        return self.status in [self.Status.PENDING, self.Status.CONFIRMED]


class OrderItem(models.Model):
    """Line items in an order"""
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=300)  # Snapshotted name
    product_price = models.DecimalField(max_digits=12, decimal_places=2)  # Price at purchase
    quantity = models.PositiveIntegerField()
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    class Meta:
        db_table = 'order_items'
    
    def __str__(self):
        return f"{self.product_name} x{self.quantity}"
    
    @property
    def subtotal(self):
        return (self.product_price * self.quantity) - self.discount


class OrderStatusHistory(models.Model):
    """Order status change history"""
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_history')
    status = models.CharField(max_length=20)
    note = models.CharField(max_length=200, blank=True)
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'order_status_history'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.order.order_number} - {self.status}"


class ActivityLog(models.Model):
    """Order activity logs (for rep dashboard)"""
    
    class Action(models.TextChoices):
        VIEWED = 'viewed', 'Viewed'
        CALLED = 'called', 'Called Customer'
        NOTE_ADDED = 'note_added', 'Added Note'
        STATUS_CHANGED = 'status_changed', 'Changed Status'
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='activity_logs')
    action = models.CharField(max_length=20, choices=Action.choices)
    description = models.CharField(max_length=200)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'order_activity_logs'
        ordering = ['-created_at']