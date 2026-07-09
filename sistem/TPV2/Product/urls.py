from django.urls import path
from Product.views import Controller

controller = Controller()

urlpatterns = [
    path('', controller.home, name='product_home'),
    path('register/', controller.save_prod, name='template_product_register'),
    path('edit/', controller.product_edit_view, name='template_product_edit'),
    #Testado
    path('save/', controller.saveProduct, name='save_product'),
    #Testado
    path('update/', controller.updateProduct, name='update_product'),
    #Testado
    path('return/', controller.returnProduct, name='return_product'),
    #Testado
    path('list/', controller.listProducts, name='list_products'),
    #Testado
    path('update_price/', controller.updatePriceProduct, name='update_price_product'),
    #Testado
    path('delete/', controller.deleteProduct, name='delete_product')
]