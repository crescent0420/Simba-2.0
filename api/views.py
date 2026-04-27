from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import Product, Cart, Order, OrderItem
from .serializers import (
    RegisterSerializer, UserSerializer, ProductSerializer,
    CartItemSerializer, OrderSerializer
)

User = get_user_model()


# ── AUTH ──────────────────────────────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


# ── PRODUCTS ──────────────────────────────────────────────────────────────────

class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Product.objects.all()
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        in_stock = self.request.query_params.get('in_stock')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')

        if category:
            qs = qs.filter(category__iexact=category)
        if search:
            qs = qs.filter(name__icontains=search)
        if in_stock == 'true':
            qs = qs.filter(in_stock=True)
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)

        return qs


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'product_id'


class CategoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        categories = Product.objects.values_list('category', flat=True).distinct()
        return Response(sorted(set(categories)))


# ── CART ──────────────────────────────────────────────────────────────────────

class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = Cart.objects.filter(user=request.user).select_related('product')
        serializer = CartItemSerializer(items, many=True)
        total = sum(item.subtotal for item in items)
        return Response({'items': serializer.data, 'total': total})

    def delete(self, request):
        Cart.objects.filter(user=request.user).delete()
        return Response({'message': 'Cart cleared'})


class CartAddView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            product = Product.objects.get(product_id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)

        if not product.in_stock:
            return Response({'error': 'Product is out of stock'}, status=400)

        cart_item, created = Cart.objects.get_or_create(
            user=request.user,
            product=product,
            defaults={'quantity': quantity}
        )
        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        return Response(CartItemSerializer(cart_item).data, status=201)


class CartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try:
            item = Cart.objects.get(pk=pk, user=request.user)
        except Cart.DoesNotExist:
            return Response({'error': 'Item not found'}, status=404)

        quantity = int(request.data.get('quantity', 1))
        if quantity <= 0:
            item.delete()
            return Response({'message': 'Item removed'})
        item.quantity = quantity
        item.save()
        return Response(CartItemSerializer(item).data)

    def delete(self, request, pk):
        try:
            item = Cart.objects.get(pk=pk, user=request.user)
            item.delete()
            return Response({'message': 'Item removed'})
        except Cart.DoesNotExist:
            return Response({'error': 'Item not found'}, status=404)


# ── ORDERS ────────────────────────────────────────────────────────────────────

class OrderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).prefetch_related('items__product')
        return Response(OrderSerializer(orders, many=True).data)

    def post(self, request):
        cart_items = Cart.objects.filter(user=request.user).select_related('product')
        if not cart_items.exists():
            return Response({'error': 'Your cart is empty'}, status=400)

        total = sum(item.subtotal for item in cart_items)

        order = Order.objects.create(
            user=request.user,
            total_price=total,
            delivery_name=request.data.get('delivery_name', ''),
            delivery_phone=request.data.get('delivery_phone', ''),
            delivery_address=request.data.get('delivery_address', ''),
        )

        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price_at_purchase=item.product.price,
            )

        cart_items.delete()

        return Response(OrderSerializer(order).data, status=201)


class OrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, user=request.user)
            return Response(OrderSerializer(order).data)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)


class OrderPayView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)

        if order.paid:
            return Response({'error': 'Order already paid'}, status=400)

        # Simulate MoMo payment — in production connect to MTN API here
        order.paid = True
        order.status = 'confirmed'
        order.save()

        return Response({
            'message': 'Payment successful',
            'order_id': order.id,
            'status': order.status,
            'total_paid': order.total_price,
        })