# users/views.py
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import filters
from django.contrib.auth import get_user_model
from .models import Branch, Address
from .serializers import (
    BranchSerializer, AddressSerializer, UserSerializer, 
    UserCreateSerializer, UserUpdateSerializer, PasswordChangeSerializer
)

User = get_user_model()


from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import SimbaTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """User registration endpoint. Returns JWT tokens + user so the client
    is logged in immediately (matches the frontend's expectation of
    `data.access` and `data.user`)."""
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)


class SimbaTokenObtainPairView(TokenObtainPairView):
    """Login endpoint accepting phone / email / username."""
    serializer_class = SimbaTokenObtainPairSerializer
    permission_classes = [AllowAny]


class MeView(APIView):
    """Get or update current user"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response(UserSerializer(request.user).data)
    
    def patch(self, request):
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)


class ChangePasswordView(APIView):
    """Change user password"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'message': 'Password changed successfully.'})


class BranchListView(generics.ListAPIView):
    """List active branches"""
    queryset = Branch.objects.filter(is_active=True)
    serializer_class = BranchSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'address']


class AddressListView(generics.ListCreateAPIView):
    """List or create user addresses"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AddressSerializer
        return AddressSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete address"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        return AddressSerializer


class CheckPhoneView(APIView):
    """Check if phone number exists"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        phone = request.data.get('phone', '')
        exists = User.objects.filter(phone=phone).exists()
        return Response({'exists': exists, 'phone': phone})