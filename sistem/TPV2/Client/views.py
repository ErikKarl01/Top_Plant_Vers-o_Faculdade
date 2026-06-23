from Client.dto import ClientDTO, AdressDTO
from django.http import JsonResponse
from Client.service.serviceCentralized import ServiceCentralized
from django.views.decorators.csrf import csrf_exempt
import json

class Controller:
    service = ServiceCentralized()
    @csrf_exempt
    def clientSave(self, request):
        data = json.loads(request.body)
        clientDTO = ClientDTO(**data.get('client', {}))
        return JsonResponse(self.service.saveClientResponse(clientDTO=clientDTO))
    
    @csrf_exempt
    def adressSave(self, request):
        data = json.loads(request.body)
        code_client = data.get('code_client', '')
        adressDTO = AdressDTO(**data.get('adress', {}))
        return JsonResponse(self.service.saveAdressResponse(adressDTO=adressDTO, code_client=code_client))
    
    @csrf_exempt
    def modifyClient(self, request):
        data = json.loads(request.body)
        clientDTO = ClientDTO(**data.get('client', {}))
        code_client = data.get('code_client', '')
        res = self.service.modifyClientResponse(clientDTO=clientDTO, code_client=code_client)
        return JsonResponse(res, status=res.get('status', 200))
    
    @csrf_exempt
    def modifyAdress(self, request):
        data = json.loads(request.body)
        adressDTO = AdressDTO(**data.get('adress', {}))
        code_client = data.get('code_client', '')
        res = self.service.modifyAdressResponse(adressDTO=adressDTO, code_client=code_client)
        return JsonResponse(res, status=res.get('status', 200))
    
    @csrf_exempt
    def clientDelete(self, request): 
        data = json.loads(request.body)
        code_client = data.get('code_client', '')
        return JsonResponse(self.service.deleteResponse(code_client=code_client))
    
    @csrf_exempt
    def clientReturn(self, request):
        data = json.loads(request.body)
        name = data.get('name', '')
        doc = data.get('doc', '')
        code_client = data.get('code_client', '')
        return JsonResponse(self.service.returnIntanceResponse(code_client=code_client, doc=doc, name=name))
    
    @csrf_exempt
    def clientList(self, request):
        return JsonResponse(self.service.listInstancesResponse())
