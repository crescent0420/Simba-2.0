# users/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """Extended User model with role and phone"""
    
    class Role(models.TextChoices):
        BUYER = 'buyer', _('Buyer')
        REP = 'rep', _('Market Representative')
        ADMIN = 'admin', _('Admin')
    
    phone = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.BUYER)
    branch = models.ForeignKey('Branch', on_delete=models.SET_NULL, null=True, blank=True, related_name='reps')
    
    class Meta:
        db_table = 'users'
    
    def __str__(self):
        return self.username or self.email or self.phone


class Branch(models.Model):
    """Physical store locations"""
    
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    emoji = models.CharField(max_length=10, default='📍')
    is_active = models.BooleanField(default=True)
    opening_hours = models.CharField(max_length=100, blank=True)  # e.g., "7AM - 9PM"
    
    class Meta:
        db_table = 'branches'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.emoji} {self.name}"


class Address(models.Model):
    """User delivery addresses"""
    
    class AddressType(models.TextChoices):
        HOME = 'home', _('Home')
        WORK = 'work', _('Work')
        OTHER = 'other', _('Other')
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    label = models.CharField(max_length=50)  # e.g., "Home", "Work"
    address_type = models.CharField(max_length=20, choices=AddressType.choices, default=AddressType.HOME)
    street = models.TextField()
    city = models.CharField(max_length=50, default='Kigali')
    sector = models.CharField(max_length=50, blank=True)
    cell = models.CharField(max_length=50, blank=True)
    village = models.CharField(max_length=50, blank=True)
    instructions = models.TextField(blank=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_addresses'
        ordering = ['-is_default', '-created_at']
    
    def __str__(self):
        return f"{self.label} - {self.user.username}"
    
    def save(self, *args, **kwargs):
        if self.is_default:
            Address.objects.filter(user=self.user, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)


class UserProfile(models.Model):
    """Additional user profile data"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, blank=True)
    prefered_language = models.CharField(max_length=10, default='en')
    notifications_enabled = models.BooleanField(default=True)
    marketing_opt_in = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_profiles'
    
    def __str__(self):
        return f"Profile: {self.user.username}"