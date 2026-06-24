import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from Stock.service.serviceCentralize import ServiceCentralize
class StockController:
    service = ServiceCentralize()

    def _get_data(self, request):
        if not request.body:
            return {}
        try:
            return json.loads(request.body)
        except json.JSONDecodeError:
            return None

    @csrf_exempt
    def createItemStock(self, request):
        if request.method == 'POST':
            data = self._get_data(request)
            if data is None:
                return JsonResponse({'message': 'JSON inválido ou malformado.'}, status=400)
                
            code_product = data.get('code_product', '')
            type_product = data.get('type_product', '')
            
            res = self.service.createItemStockResponse(code_product=code_product, type_product=type_product)
            return JsonResponse(res, status=res.get('status', 200))
        return JsonResponse({'message': 'Método não permitido'}, status=405)

    @csrf_exempt
    def returnStockWithItems(self, request):
        if request.method == 'POST' or request.method == 'GET':
            data = self._get_data(request)
            if data is None:
                return JsonResponse({'message': 'JSON inválido ou malformado.'}, status=400)
                
            stock_code = data.get('stock_code', '')
            
            res = self.service.returnStockWithItemsResponse(stock_code=stock_code)
            return JsonResponse(res, status=res.get('status', 200))
        return JsonResponse({'message': 'Método não permitido'}, status=405)

    @csrf_exempt
    def modifyStock(self, request):
        if request.method == 'PUT' or request.method == 'POST':
            data = self._get_data(request)
            if data is None:
                return JsonResponse({'message': 'JSON inválido ou malformado.'}, status=400)
                
            stove_name = data.get('stove_name', '')
            stock_code = data.get('stock_code', '')
            
            res = self.service.modifyStockResponse(stove_name=stove_name, stock_code=stock_code)
            return JsonResponse(res, status=res.get('status', 200))
        return JsonResponse({'message': 'Método não permitido'}, status=405)

    @csrf_exempt
    def updateAmountAndLog(self, request):
        if request.method == 'PUT' or request.method == 'POST':
            data = self._get_data(request)
            if data is None:
                return JsonResponse({'message': 'JSON inválido ou malformado.'}, status=400)
                
            product_code = data.get('product_code', '')
            operation_type = data.get('operation_type', '')
            
            raw_amount = data.get('amount_changed', 0)
            try:
                amount_changed = int(raw_amount if raw_amount is not None else 0)
            except ValueError:
                return JsonResponse({'message': 'Erro de tipo: amount_changed deve ser um número inteiro válido.'}, status=400)
            
            res = self.service.updateAmountAndLogResponse(
                product_code=product_code, 
                operation_type=operation_type, 
                amount_changed=amount_changed
            )
            return JsonResponse(res, status=res.get('status', 200))
        return JsonResponse({'message': 'Método não permitido'}, status=405)

    @csrf_exempt
    def deleteStock(self, request):
        if request.method == 'DELETE' or request.method == 'POST':
            data = self._get_data(request)
            if data is None:
                return JsonResponse({'message': 'JSON inválido ou malformado.'}, status=400)
                
            stock_code = data.get('stock_code', '')
            
            res = self.service.deleteStockResponse(stock_code=stock_code)
            return JsonResponse(res, status=res.get('status', 200))
        return JsonResponse({'message': 'Método não permitido'}, status=405)

    @csrf_exempt
    def deleteStockItem(self, request):
        if request.method == 'DELETE' or request.method == 'POST':
            data = self._get_data(request)
            if data is None:
                return JsonResponse({'message': 'JSON inválido ou malformado.'}, status=400)
                
            code_product = data.get('code_product', '')
            
            res = self.service.deleteStockItemResponse(code_product=code_product)
            return JsonResponse(res, status=res.get('status', 200))
        return JsonResponse({'message': 'Método não permitido'}, status=405)