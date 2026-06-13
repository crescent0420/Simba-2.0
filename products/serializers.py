# products/serializers.py
from rest_framework import serializers
from .models import Category, Product, ProductImage, Review, Wishlist, Cart


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()
    subcategories = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'emoji', 'description', 'image', 'parent', 'product_count', 'subcategories', 'is_active']
    
    def get_product_count(self, obj):
        return obj.products.filter(in_stock=True).count()
    
    def get_subcategories(self, obj):
        subs = obj.subcategories.filter(is_active=True)
        return CategorySerializer(subs, many=True).data


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'order']


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_avatar = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = ['id', 'user', 'user_name', 'user_avatar', 'rating', 'title', 'comment', 'is_verified_purchase', 'helpful_count', 'created_at']
    
    def get_user_avatar(self, obj):
        return obj.user.get_full_name()[:2].upper() if obj.user.get_full_name() else obj.user.username[:2].upper()


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_emoji = serializers.CharField(source='category.emoji', read_only=True)
    has_discount = serializers.BooleanField(read_only=True)
    current_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    discount_percent = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'product_id', 'name', 'slug', 'description', 'price', 'discount_price',
            'current_price', 'discount_percent', 'has_discount', 'image', 'category',
            'category_name', 'category_emoji', 'in_stock', 'stock_quantity', 'unit',
            'is_featured', 'is_new', 'created_at'
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    reviews = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'product_id', 'name', 'slug', 'description', 'price', 'discount_price',
            'image', 'images', 'category', 'category_id',
            'in_stock', 'stock_quantity', 'unit', 'barcode', 'brand',
            'is_featured', 'is_new', 'discount_percent',
            'reviews', 'average_rating', 'review_count',
            'created_at', 'updated_at'
        ]
    
    def get_reviews(self, obj):
        reviews = obj.reviews.filter(is_approved=True)[:5]
        return ReviewSerializer(reviews, many=True).data
    
    def get_average_rating(self, obj):
        from django.db.models import Avg
        result = obj.reviews.filter(is_approved=True).aggregate(Avg('rating'))
        return result['rating__avg'] or 0
    
    def get_review_count(self, obj):
        return obj.reviews.filter(is_approved=True).count()


class WishlistSerializer(serializers.ModelSerializer):
    products = ProductListSerializer(many=True, read_only=True)
    product_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Wishlist
        fields = ['id', 'products', 'product_count', 'created_at', 'updated_at']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['product_count'] = instance.products.count()
        return data


# Cart Serializers
class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = Cart
        fields = ['id', 'product', 'quantity', 'subtotal', 'added_at']
        read_only_fields = ['id', 'added_at']


class CartAddSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)


class CartUpdateSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=0)