from django.urls import path
from .views import StockController

controller = StockController()

urlpatterns = [
    path('stock/return/', controller.returnStockWithItems, name='return_stock'),
    path('stock/modify/', controller.modifyStock, name='modify_stock'),
    path('stock/item/update-amount/', controller.updateAmountAndLog, name='update_amount_and_log'),
    path('stock/delete/', controller.deleteStock, name='delete_stock'),
    path('stock/item/delete/', controller.deleteStockItem, name='delete_stock_item'),
]