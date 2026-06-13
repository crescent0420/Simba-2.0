# payments/models.py
from django.db import models
from django.conf import settings


class Payment(models.Model):
    """Payment records"""
    
    class Provider(models.TextChoices):
        MTN_MOMO = 'mtn_momo', 'MTN Mobile Money'
        VODACOM_CASH = 'vodacom_cash', 'Vodacom Cash'
        AIRTEL_MONEY = 'airtel_money', 'Airtel Money'
        CARD = 'card', 'Card'
    
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PROCESSING = 'processing', 'Processing'
        SUCCESS = 'success', 'Success'
        FAILED = 'failed', 'Failed'
        CANCELLED = 'cancelled', 'Cancelled'
        REFUNDED = 'refunded', 'Refunded'
    
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, related_name='payments')
    provider = models.CharField(max_length=20, choices=Provider.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='RWF')
    reference = models.CharField(max_length=100, unique=True)  # Provider reference
    provider_transaction_id = models.CharField(max_length=100, blank=True)
    payer_phone = models.CharField(max_length=20)
    payer_note = models.TextField(blank=True)
    failure_reason = models.TextField(blank=True)
    callback_data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'payments'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['reference']),
            models.Index(fields=['provider_transaction_id']),
        ]
    
    def __str__(self):
        return f"Payment #{self.reference} - {self.status}"


class Coupon(models.Model):
    """Promotional coupons"""
    
    class DiscountType(models.TextChoices):
        PERCENTAGE = 'percentage', 'Percentage'
        FIXED = 'fixed', 'Fixed Amount'
    
    code = models.CharField(max_length=20, unique=True)
    description = models.CharField(max_length=200, blank=True)
    discount_type = models.CharField(max_length=20, choices=DiscountType.choices)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    min_order_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    max_discount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    max_uses = models.PositiveIntegerField(default=1)
    uses_count = models.PositiveIntegerField(default=0)
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'coupons'
    
    def __str__(self):
        return self.code
    
    def is_valid(self):
        from django.utils import timezone
        now = timezone.now()
        return (
            self.is_active and
            self.valid_from <= now <= self.valid_until and
            self.uses_count < self.max_uses
        )
    
    def calculate_discount(self, order_amount):
        if not self.is_valid() or order_amount < self.min_order_amount:
            return 0
        
        if self.discount_type == self.DiscountType.PERCENTAGE:
            discount = order_amount * (self.discount_value / 100)
        else:
            discount = self.discount_value
        
        if self.max_discount:
            discount = min(discount, self.max_discount)
        
        return min(discount, order_amount)


class CouponUsage(models.Model):
    """Track coupon usage per user"""
    
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE, related_name='usages')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='coupon_usages')
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, related_name='coupon_usages')
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'coupon_usages'
        unique_together = ('coupon', 'user')