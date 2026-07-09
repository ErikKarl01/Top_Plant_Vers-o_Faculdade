from django.contrib import admin
from django.urls import path, include
from django.shortcuts import render
import templates

def home_sistem(request):
    return render(request, 'login/login.html')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home_sistem),
    path('client/', include('Client.urls')),
    path('product/', include('Product.urls')),
    path('order/', include('Order.urls')),
    path('stock/', include('Stock.urls')),
]
