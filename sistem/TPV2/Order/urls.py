from django.urls import path
from .views import OrderController

controller = OrderController()

urlpatterns = [
    #Testado
    path('snapshot/update/', controller.updateSnapshot, name='update_snapshot'),
    #Testado
    path('order/create/', controller.createOrder, name='create_order'),
    #Testado
    path('order/update/', controller.updateOrder, name='update_order'),
    #Testado
    path('order/get/', controller.getOrderByCode, name='get_order_by_code'),
    #Testado
    path('order/return/', controller.returnOrder, name='return_order'),
    #Testado
    path('order/delete/', controller.deleteOrder, name='delete_order'),
    #Testado
    path('snapshot/list/', controller.listSnapshots, name='return_snapshots'),
    #Testado
    path('snapshot/ordenated_by_target/', controller.returSnapshotsOrdenated, name='snapshot_ordenated_by_target'),
    #Testado
    path('total_order/', controller.totalValuenReturn, name='return_tatal_value_order')
]