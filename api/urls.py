from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path('auth/register/', views.RegisterView.as_view()),
    path('auth/login/', TokenObtainPairView.as_view()),
    path('auth/refresh/', TokenRefreshView.as_view()),
    path('auth/me/', views.MeView.as_view()),

    # Products
    path('products/', views.ProductListView.as_view()),
    path('products/<int:product_id>/', views.ProductDetailView.as_view()),
    path('categories/', views.CategoryListView.as_view()),

    # Cart
    path('cart/', views.CartView.as_view()),
    path('cart/add/', views.CartAddView.as_view()),
    path('cart/<int:pk>/', views.CartItemView.as_view()),

    # Orders
    path('orders/', views.OrderListView.as_view()),
    path('orders/<int:pk>/', views.OrderDetailView.as_view()),
    path('orders/<int:pk>/pay/', views.OrderPayView.as_view()),
]