# products/views.py
from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.db.models import Q, Avg, Count
from .models import Category, Product, ProductImage, Review, Wishlist, Cart
from .serializers import (
    CategorySerializer, ProductListSerializer, 
    ProductDetailSerializer, ReviewSerializer, WishlistSerializer,
    CartItemSerializer, CartAddSerializer, CartUpdateSerializer
)


class CategoryListView(generics.ListAPIView):
    """List all categories"""
    queryset = Category.objects.filter(is_active=True, parent__isnull=True)
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']


class ProductListView(generics.ListAPIView):
    """List products with filtering"""
    queryset = Product.objects.all()
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'brand', 'category__name']
    ordering_fields = ['price', '-price', 'created_at', '-created_at', 'name']
    
    def get_queryset(self):
        qs = super().get_queryset()
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category__slug=category)
        
        # Filter by in_stock
        in_stock = self.request.query_params.get('in_stock')
        if in_stock == 'true':
            qs = qs.filter(in_stock=True)
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)
        
        # Filter by featured
        featured = self.request.query_params.get('featured')
        if featured == 'true':
            qs = qs.filter(is_featured=True)
        
        return qs


class ProductDetailView(generics.RetrieveAPIView):
    """Get product details"""
    queryset = Product.objects.all()
    serializer_class = ProductDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = 'product_id'
    lookup_url_kwarg = 'id'


class ProductSearchView(APIView):
    """Search products"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        query = request.query_params.get('q', '')
        limit = int(request.query_params.get('limit', 20))
        
        products = Product.objects.filter(
            Q(name__icontains=query) | 
            Q(description__icontains=query) |
            Q(brand__icontains=query)
        )[:limit]
        
        return Response(ProductListSerializer(products, many=True).data)


class FeaturedProductsView(generics.ListAPIView):
    """Get featured products"""
    queryset = Product.objects.filter(is_featured=True, in_stock=True)[:20]
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]


class NewProductsView(generics.ListAPIView):
    """Get new products"""
    queryset = Product.objects.filter(is_new=True, in_stock=True)[:20]
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]


class RelatedProductsView(APIView):
    """Get related products"""
    permission_classes = [AllowAny]
    
    def get(self, request, id):
        product = get_object_or_404(Product, product_id=id)
        products = Product.objects.filter(
            category=product.category
        ).exclude(product_id=id).filter(in_stock=True)[:10]
        
        return Response(ProductListSerializer(products, many=True).data)


class ReviewListView(generics.ListCreateAPIView):
    """List or create product reviews"""
    permission_classes = [IsAuthenticated]
    serializer_class = ReviewSerializer
    
    def get_queryset(self):
        product_id = self.kwargs['id']
        return Review.objects.filter(product__product_id=product_id, is_approved=True)
    
    def perform_create(self, serializer):
        product = get_object_or_404(Product, product_id=self.kwargs['id'])
        serializer.save(product=product, user=self.request.user)


# Wishlist
class WishlistView(APIView):
    """Get or update user wishlist"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        return Response(WishlistSerializer(wishlist).data)
    
    def post(self, request):
        product_id = request.data.get('product_id')
        product = get_object_or_404(Product, product_id=product_id)
        
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        wishlist.add(product)
        
        return Response(WishlistSerializer(wishlist).data)
    
    def delete(self, request):
        product_id = request.data.get('product_id')
        product = get_object_or_404(Product, product_id=product_id)
        
        wishlist = Wishlist.objects.get(user=request.user)
        wishlist.remove(product)
        
        return Response(WishlistSerializer(wishlist).data)


# Cart Views
class CartView(APIView):
    """Get user's cart"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        cart = Cart.objects.filter(user=request.user).select_related('product')
        total = sum(item.subtotal for item in cart)
        
        return Response({
            'items': CartItemSerializer(cart, many=True).data,
            'total': total,
            'count': cart.count()
        })
    
    def post(self, request):
        """Add item to cart"""
        serializer = CartAddSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        product = get_object_or_404(
            Product, 
            product_id=serializer.validated_data['product_id']
        )
        
        if not product.in_stock:
            return Response(
                {'error': 'Product is out of stock'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        quantity = serializer.validated_data.get('quantity', 1)
        
        cart_item, created = Cart.objects.get_or_create(
            user=request.user,
            product=product,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        
        return Response(CartItemSerializer(cart_item).data, status=status.HTTP_201_CREATED)
    
    def delete(self, request):
        """Clear cart"""
        Cart.objects.filter(user=request.user).delete()
        return Response({'message': 'Cart cleared'})


class CartItemDetailView(APIView):
    """Update or remove cart item"""
    permission_classes = [IsAuthenticated]
    
    def put(self, request, id):
        """Update quantity"""
        cart_item = get_object_or_404(Cart, id=id, user=request.user)
        
        serializer = CartUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        quantity = serializer.validated_data['quantity']
        
        if quantity <= 0:
            cart_item.delete()
            return Response({'message': 'Item removed'})
        
        cart_item.quantity = quantity
        cart_item.save()
        
        return Response(CartItemSerializer(cart_item).data)
    
    def delete(self, request, id):
        """Remove item"""
        cart_item = get_object_or_404(Cart, id=id, user=request.user)
        cart_item.delete()
        
        return Response({'message': 'Item removed'})


class CategoryWithProductsView(generics.ListAPIView):
    """Categories with product counts"""
    queryset = Category.objects.filter(is_active=True, parent__isnull=True)
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]