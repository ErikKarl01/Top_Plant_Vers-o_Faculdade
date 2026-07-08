from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('client/', include('Client.urls')),
    path('product/', include('Product.urls')),
    path('order/', include('Order.urls')),
    path('stock/', include('Stock.urls')),
]
