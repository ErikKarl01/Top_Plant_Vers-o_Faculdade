from django.http import JsonResponse
from Product.service import Service
from Product.dto import ProductDTO
from django.views.decorators.csrf import csrf_exempt
import json


class Controller():
    service = Service()
    @csrf_exempt
    def saveProduct(self, request):
        if request.method == 'POST':
            data = json.loads(request.body)
            productDTO = ProductDTO(**data.get('product', {}))
            return JsonResponse(self.service.productSave(product=productDTO).toDict())
        else:
            return JsonResponse({'mensage': 'Method not allowed'}, status=405)
    @csrf_exempt
    def updateProduct(self, request):
        if request.method == 'POST':
            data = json.loads(request.body)
            productDTO = ProductDTO(**data.get('product', {}))
            code_product = data.get('code_product', '')
            return JsonResponse(self.service.productUpdate(product=productDTO, code_product=code_product).toDict())
        else:
            return JsonResponse({'mensage': 'Method not allowed'}, status=405)
    @csrf_exempt  
    def returnProduct(self, request):
        if request.method == 'POST':
            data = json.loads(request.body)
            code_product = data.get('code_product', '')
            name = data.get('name', '')
            return JsonResponse(self.service.productReturn(code_product=code_product, name=name).toDict())
        else:
            return JsonResponse({'mensage': 'Method not allowed'}, status=405)
    @csrf_exempt  
    def listProducts(self, request):
        if request.method == 'GET':
            return JsonResponse(self.service.productList().toDict())
        else:
            return JsonResponse({'mensage': 'Method not allowed'}, status=405)
    @csrf_exempt  
    def updatePriceProduct(self, request):
        if request.method == 'POST':
            data = json.loads(request.body)
            code_product = data.get('code_product', '')
            name = data.get('name', '')
            price = data.get('price', 0.0)
            return JsonResponse(self.service.productUpdatePrice(code_product=code_product, name=name, price=price).toDict())
        else:
            return JsonResponse({'mensage': 'Method not allowed'}, status=405)
    @csrf_exempt   
    def updateDiscountProduct(self, request):
        if request.method == 'POST':
            data = json.loads(request.body)
            code_product = data.get('code_product', '')
            name = data.get('name', '')
            discount = data.get('discount', 0.0)
            return JsonResponse(self.service.productUpdateDiscount(code_product=code_product, name=name, discount=discount).toDict())
        else:
            return JsonResponse({'mensage': 'Method not allowed'}, status=405)
    @csrf_exempt   
    def deleteProduct(self, request):
        if request.method == 'POST':
            data = json.loads(request.body)
            code_product = data.get('code_product', '')
            return JsonResponse(self.service.productDelete(code_product=code_product).toDict())
        else:
            return JsonResponse({'mensage': 'Method not allowed'}, status=405)