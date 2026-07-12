from Stock.service import Service
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
import json


class Controller:
    response = Service()
    
    def home(self, request):
        return render(request, 'stock/stock_home/stock_list.html')
    
    def operationsHome(self, request):
        return render(request, 'stock/operations/operations_list.html')
    
    @csrf_exempt
    def addAmount(self, request):
        data = json.loads(request.body)
        code_product = data.get('code_product', '')
        amount = data.get('amount', 0)
        res = self.response.addAmount(code_product=code_product, amount=amount).toDict()
        return JsonResponse(res, status=res.get('status', 200), safe=False)
    
    @csrf_exempt
    def removeAmount(self, request):
        data = json.loads(request.body)
        code_product = data.get('code_product', '')
        amount = data.get('amount', 0)
        res = self.response.removeAmount(code_product=code_product, amount=amount).toDict()
        return JsonResponse(res, status=res.get('status', 200), safe=False)
    
    @csrf_exempt
    def stockReturnForCategory(self, request):
        data = json.loads(request.body)
        category = data.get('category', '')
        products_licensed = data.get('products_licensed', False)
        res = self.response.stockReturnForCategory(category=category, products_licensed=products_licensed).toDict()
        print(res)
        return JsonResponse(res, status=res.get('status', 200), safe=False)
    
    @csrf_exempt
    def operationsReturn(self, request):
        data = json.loads(request.body)
        code_product = data.get('code_product', '')
        stock_code = data.get('stock_code', '')
        time_interval = data.get('time_interval', {})
        res = self.response.operationsReturn(stock_code=stock_code,
                                             code_product=code_product,
                                             time_interval=time_interval).toDict()
        print(res)
        return JsonResponse(res, status=res.get('status', 200), safe=False)