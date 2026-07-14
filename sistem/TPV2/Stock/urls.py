from django.urls import path
from Stock.views import Controller as StockController

controller = StockController()

urlpatterns = [
    path('', controller.home, name='stock_home'),
    path('stock_operations_home_template/', controller.operationsHome, name='stock_operations_template'),
    #Testado
    path('addAmount/', controller.addAmount, name='addAmount'),
    #Testado
    path('removeAmount/', controller.removeAmount, name='removeAmount'),
    
    path('stockReturnForCategory/', controller.stockReturnForCategory, name='stockReturnForCategory'),
    #Testado
    path('operationsReturn/', controller.operationsReturn, name='operationsReturn'),
    path('itemAmountReturn/', controller.itemAmountReturn, name='itemAmountReturn')
]