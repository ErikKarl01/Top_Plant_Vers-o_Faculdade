import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from Order.service.serviceCentralize import ServiceCentralized
from Order.models import Snapshot
from utils.converet.convertOrder import ConvertSnapshot

class OrderController:
    service = ServiceCentralized()
    @csrf_exempt
    def updateSnapshot(self, request):
        data = json.loads(request.body)
        try:
            code_snapshot = data.get('code_snapshot', '')
            price_product = float(data.get('price_product', -1))
            discount = float(data.get('discount', 0.0))
        except Exception as e:
            return JsonResponse(
                {"mensagem": "Valor inválido detectado, somente valores numéricos são aceitos em preço e desconto"},
                status=400)
        res = self.service.updateSnapshot(code_snapshot=code_snapshot, price_product=price_product, discount=discount).toDict()
        return JsonResponse(res, status=res.get('status', 200))
    
    @csrf_exempt
    def listSnapshots(self, request):
        res = self.service.listSnapshots().toDict()
        return JsonResponse(res, status=res.get('status', 200))
    
    @csrf_exempt
    def returSnapshotsOrdenated(self, request):
        data = json.loads(request.body)
        price_target = data.get('price_target', 0)
        res = self.service.returnSnapshotsTarget(price_target).toDict()
        return JsonResponse(res, status=res.get('status', 200))

    @csrf_exempt
    def createOrder(self, request):
        data = json.loads(request.body)
        code_client = data.get('code_client', '')
        items = data.get('items', [])
        res = self.service.createOrder(code_client=code_client, items=items).toDict()
        print(res.get('status', 200))
        return JsonResponse(res, status=res.get('status', 200))

    @csrf_exempt
    def updateOrder(self, request):
        data = json.loads(request.body)
        code_order = data.get('code_order', '')
        items_to_discount = data.get('items_to_discount', [])
        res = self.service.updateOrder(code_order=code_order, items=items_to_discount).toDict()
        return JsonResponse(res, status=res.get('status', 200))
    
    @csrf_exempt
    def totalValuenReturn(self, request):
        data = json.loads(request.body)
        items = data.get('items', [])
        res = self.service.totalValueReturn(items=items).toDict()
        return JsonResponse(res, status=res.get('status', 200))

    @csrf_exempt
    def getOrderByCode(self, request):
        data = json.loads(request.body)
        code_order = data.get('code_order', '')
        res = self.service.getOrderByCode(code_order=code_order).toDict()
        return JsonResponse(res, status=res.get('status', 200))

    @csrf_exempt
    def returnOrder(self, request):
        data = json.loads(request.body)
        time_interval = data.get('time_interval', {})
        status = data.get('status', '')
        code_client = data.get('code_client', '')
        res = self.service.returnOrder(time_interval=time_interval, status=status, code_client=code_client).toDict()
        return JsonResponse(res, status=res.get('status', 200))

    @csrf_exempt
    def deleteOrder(self, request):
        data = json.loads(request.body)
        code_order = data.get('code_order', '')
        res = self.service.deleteOrder(code_order=code_order).toDict()
        return JsonResponse(res, status=res.get('status', 200))