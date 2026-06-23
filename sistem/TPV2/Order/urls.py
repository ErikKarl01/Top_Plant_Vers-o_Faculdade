from django.urls import path
from .views import OrderController

controller = OrderController()

urlpatterns = [
    path('snapshot/update/', controller.updateSnapshot, name='update_snapshot'),
    path('order/create/', controller.createOrder, name='create_order'),
    path('order/update/', controller.updateOrder, name='update_order'),
    path('order/get/', controller.getOrderByCode, name='get_order_by_code'),
    path('order/return/', controller.returnOrder, name='return_order'),
    path('order/delete/', controller.deleteOrder, name='delete_order'),
]