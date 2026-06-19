from django.urls import path
from Product.views import Controller

urlpatterns = [
    path('save/', Controller.saveProduct, name='save_product'),
    path('update/', Controller.updateProduct, name='update_product'),
    path('return/', Controller.returnProduct, name='return_product'),
    path('list/', Controller.listProducts, name='list_products'),
    path('update_price/', Controller.updatePriceProduct, name='update_price_product'),
    path('update_discount/', Controller.updateDiscountProduct, name='update_discount_product'),
    path('delete/', Controller.deleteProduct, name='delete_product')
]