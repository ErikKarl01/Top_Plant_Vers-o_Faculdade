from django.urls import path
from Stock.views import Controller as StockController

controller = StockController()

urlpatterns = [
    #Testado
    path('addAmount/', controller.addAmount, name='addAmount'),
    #Testado
    path('removeAmount/', controller.removeAmount, name='removeAmount'),
    
    path('stockReturnForCategory/', controller.stockReturnForCategory, name='stockReturnForCategory'),
    #Testado
    path('operationsReturn/', controller.operationsReturn, name='operationsReturn'),
]