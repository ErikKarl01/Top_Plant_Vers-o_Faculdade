from django.urls import path
from Client.views import Controller

controller = Controller()

urlpatterns = [
    path('save-client/', controller.clientSave, name='save_client'),
    path('save-adress/', controller.adressSave, name='save_adress'),
    path('search/', controller.clientReturn, name='search_client'),
    path('list/', controller.clientList, name='list_client'),
    path('modify/', controller.clientModify, name='modify_client')
]