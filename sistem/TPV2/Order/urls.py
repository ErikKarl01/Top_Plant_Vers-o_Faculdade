from django.urls import path
from .views import OrderController

controller = OrderController()

urlpatterns = [
    path('snapshot/update/', controller.updateSnapshot, name='update_snapshot'),
    path('create/', controller.createOrder, name='create_order'),
    path('update/', controller.updateOrder, name='update_order'),
    path('get/', controller.getOrderByCode, name='get_order_by_code'),
    path('return/', controller.returnOrder, name='return_order'),
    path('delete/', controller.deleteOrder, name='delete_order'),
]