"""
URL configuration for simba_backend project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve

# Get HTML directory
HTML_DIR = settings.STATICFILES_DIRS[0]

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API v1
    path('api/v1/auth/', include('users.urls')),
    path('api/v1/products/', include('products.urls')),
    path('api/v1/orders/', include('orders.urls')),
    path('api/v1/users/', include('users.urls')),
    
    # Serve HTML frontend
    re_path(r'^$', serve, {'path': 'index.html', 'document_root': HTML_DIR}),
    re_path(r'^shop\.html$', serve, {'path': 'shop.html', 'document_root': HTML_DIR}),
    re_path(r'^product\.html$', serve, {'path': 'product.html', 'document_root': HTML_DIR}),
    re_path(r'^checkout\.html$', serve, {'path': 'checkout.html', 'document_root': HTML_DIR}),
    re_path(r'^orders\.html$', serve, {'path': 'orders.html', 'document_root': HTML_DIR}),
    re_path(r'^wishlist\.html$', serve, {'path': 'wishlist.html', 'document_root': HTML_DIR}),
    re_path(r'^auth\.html$', serve, {'path': 'auth.html', 'document_root': HTML_DIR}),
    re_path(r'^dashboard\.html$', serve, {'path': 'dashboard.html', 'document_root': HTML_DIR}),
    re_path(r'^js/(?P<path>.*)$', serve, {'document_root': f'{HTML_DIR}/js'}),
    re_path(r'^simba_products\.json$', serve, {'path': 'simba_products.json', 'document_root': HTML_DIR}),
    re_path(r'^(?P<path>.*\.html)$', serve, {'document_root': HTML_DIR}),
]