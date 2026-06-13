# orders/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Buyer  (literal routes MUST come before the <str:number> catch-all,
    #         otherwise 'create'/'rep' get captured as an order number)
    path('', views.OrderListView.as_view(), name='order_list'),
    path('create/', views.OrderCreateView.as_view(), name='order_create'),

    # Rep
    path('rep/', views.RepOrderListView.as_view(), name='rep_order_list'),
    path('rep/dashboard/', views.RepDashboardStatsView.as_view(), name='rep_dashboard'),
    path('rep/<str:number>/status/', views.RepOrderStatusUpdateView.as_view(), name='rep_order_status'),
    path('rep/<str:number>/', views.RepOrderDetailView.as_view(), name='rep_order_detail'),

    # Buyer detail (catch-all last)
    path('<str:number>/cancel/', views.OrderCancelView.as_view(), name='order_cancel'),
    path('<str:number>/', views.OrderDetailView.as_view(), name='order_detail'),
]
