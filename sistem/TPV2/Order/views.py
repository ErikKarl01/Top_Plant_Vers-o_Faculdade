import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from Order.service.serviceCentralize import ServiceCentralized

# Create your views here.
class OrderController:
    service = ServiceCentralized()
    @csrf_exempt
    def updateSnapshot(self, request):
        data = json.loads(request.body)
        code_snapshot = data.get('code_snapshot', '')
        price_product = float(data.get('price_product', 0.0))
        discount = float(data.get('discount', 0.0))
        res = self.service.updateSnapshot(code_snapshot=code_snapshot, price_product=price_product, discount=discount)
        return JsonResponse(res, status=res.get('status', 200))

    @csrf_exempt
    def createOrder(self, request):
        data = json.loads(request.body)
        code_client = data.get('code_client', '')
        codes_product = data.get('codes_product', [])
        res = self.service.createOrder(code_client=code_client, codes_product=codes_product)
        return JsonResponse(res, status=res.get('status', 200))

    @csrf_exempt
    def updateOrder(self, request):
        data = json.loads(request.body)
        code_order = data.get('code_order', '')
        items_to_discount = data.get('items_to_discount', [])
        res = self.service.updateOrder(code_order=code_order, items_to_discount=items_to_discount)
        return JsonResponse(res, status=res.get('status', 200))

    @csrf_exempt
    def getOrderByCode(self, request):
        data = json.loads(request.body)
        code_order = data.get('code_order', '')
        res = self.service.getOrderByCode(code_order=code_order)
        return JsonResponse(res, status=res.get('status', 200))

    @csrf_exempt
    def returnOrder(self, request):
        data = json.loads(request.body)
        time_interval = data.get('time_interval', {})
        status = data.get('status', '')
        code_client = data.get('code_client', '')
        res = self.service.returnOrder(time_interval=time_interval, status=status, code_client=code_client)
        return JsonResponse(res, status=res.get('status', 200))

    @csrf_exempt
    def deleteOrder(self, request):
        data = json.loads(request.body)
        code_order = data.get('code_order', '')
        res = self.service.deleteOrder(code_order=code_order)
        return JsonResponse(res, status=res.get('status', 200))