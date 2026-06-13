# products/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Products
    path('', views.ProductListView.as_view(), name='product_list'),
    path('<int:id>/', views.ProductDetailView.as_view(), name='product_detail'),
    path('search/', views.ProductSearchView.as_view(), name='product_search'),
    path('featured/', views.FeaturedProductsView.as_view(), name='featured_products'),
    path('new/', views.NewProductsView.as_view(), name='new_products'),
    path('<int:id>/related/', views.RelatedProductsView.as_view(), name='related_products'),
    path('<int:id>/reviews/', views.ReviewListView.as_view(), name='product_reviews'),
    
    # Cart
    path('cart/', views.CartView.as_view(), name='cart'),
    path('cart/<int:id>/', views.CartItemDetailView.as_view(), name='cart_item'),
    
    # Wishlist
    path('wishlist/', views.WishlistView.as_view(), name='wishlist'),
    
    # Categories
    path('categories/', views.CategoryListView.as_view(), name='categories'),
    path('categories/products/', views.CategoryWithProductsView.as_view(), name='categories_with_products'),
]