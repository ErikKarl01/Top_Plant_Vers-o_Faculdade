from django.shortcuts import render
from django.http import JsonResponse
from sistem.TPV2.Product.service import Service
from Product.dto import ProductDTO
import json


class Controller():
    service = Service()
    def saveProduct(self, request):
        if request.method == 'POST':
            data = json.loads(request.body)
            productDTO = ProductDTO(**data.get('product', {}))
            return JsonResponse(self.service.productSave(product=productDTO))
        else:
            return JsonResponse({'mensage': 'Method not allowed'}, status=405)
    
    def updateProduct(self, request):
        if request.method == 'POST':
            data = json.loads(request.body)
            productDTO = ProductDTO(**data.get('product', {}))
            code_product = data.get('code_product', '')
            return JsonResponse(self.service.productUpdate(product=productDTO, code_product=code_product))
        else:
            return JsonResponse({'mensage': 'Method not allowed'}, status=405)
        
    def returnProduct(self, request):
        if request.method == 'POST':
            data = json.loads(request.body)
            code_product = data.get('code_product', '')
            name = data.get('name', '')
            return JsonResponse(self.service.productReturn(code_product=code_product, name=name))
        else:
            return JsonResponse({'mensage': 'Method not allowed'}, status=405)
        
    def listProducts(self, request):
        if request.method == 'GET':
            return JsonResponse(self.service.productList())
        else:
            return JsonResponse({'mensage': 'Method not allowed'}, status=405)
        
    def updatePriceProduct(self, request):
        if request.method == 'POST':
            data = json.loads(request.body)
            code_product = data.get('code_product', '')
            name = data.get('name', '')
            price = data.get('price', 0.0)
            return JsonResponse(self.service.productUpdatePrice(code_product=code_product, name=name, price=price))
        else:
            return JsonResponse({'mensage': 'Method not allowed'}, status=405)
        
    def updateDiscountProduct(self, request):
        if request.method == 'POST':
            data = json.loads(request.body)
            code_product = data.get('code_product', '')
            name = data.get('name', '')
            discount = data.get('discount', 0.0)
            return JsonResponse(self.service.productUpdateDiscount(code_product=code_product, name=name, discount=discount))
        else:
            return JsonResponse({'mensage': 'Method not allowed'}, status=405)
        
    def deleteProduct(self, request):
        if request.method == 'POST':
            data = json.loads(request.body)
            code_product = data.get('code_product', '')
            return JsonResponse(self.service.productDelete(code_product=code_product))
        else:
            return JsonResponse({'mensage': 'Method not allowed'}, status=405)