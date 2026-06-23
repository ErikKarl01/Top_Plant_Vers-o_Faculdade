from django.urls import path
from Product.views import Controller

controller = Controller()

urlpatterns = [
    path('save/', controller.saveProduct, name='save_product'),
    path('update/', controller.updateProduct, name='update_product'),
    path('return/', controller.returnProduct, name='return_product'),
    path('list/', controller.listProducts, name='list_products'),
    path('update_price/', controller.updatePriceProduct, name='update_price_product'),
    path('update_discount/', controller.updateDiscountProduct, name='update_discount_product'),
    path('delete/', controller.deleteProduct, name='delete_product')
]