from django.urls import path
from Client.views import Controller

controller = Controller()

urlpatterns = [
    #Rotas para renderização
    path("", controller.templateClient, name="template_client"),
    path("client/register/", controller.templateClientRegister, name="template_client_register"),
    path("client/edit/", controller.templateClientEdit, name="template_client_edit"),
    path("adress/register/", controller.templateAdressRegister, name="template_adress_register"),
    path("adress/edit/", controller.templateAdressEdit, name="template_adress_edit"),
    #Rotas para endpoints do sistema
    path('save-client/', controller.clientSave, name='save_client'),
    path('save-adress/', controller.adressSave, name='save_adress'),
    path('search/', controller.clientReturn, name='search_client'),
    path('list/', controller.clientList, name='list_client'),
    path('modifyClient/', controller.clientModify, name='modify_client'),
    path('modifyAdress/', controller.adressModify, name='modify_client'),
    path('delete/', controller.clientDelete, name='delete_client')
]