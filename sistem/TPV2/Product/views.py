from django.http import JsonResponse
from Product.service import Service
from Product.dto import ProductDTO
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
import json


class Controller():
    service = Service()
    
    def home(self, request):
        return render(request, 'product/product_home/product_list.html')
    
    def login_view(self, request):
        """Renderiza a tela de login (Página Inicial da raiz /)"""
        return render(request, 'login/login.html')

    def save_prod(self, request):
        """Renderiza o formulário de cadastro de novos produtos"""
        return render(request, 'product/register/product_register.html')

    def product_edit_view(self, request):
        """Renderiza o formulário de edição de produtos recebendo o código na URL"""
        return render(request, 'product/edit/product_edit.html')
    
    @csrf_exempt
    def saveProduct(self, request):
        if request.method == 'POST':
            data = json.loads(request.body)
            productDTO = ProductDTO(**data.get('product', {}))
            res = self.service.productSave(product=productDTO).toDict()
            return JsonResponse(res, status=res.get('status', 200))
        else:
            return JsonResponse({'mensage': 'Method not allowed'}, status=405)
        
    @csrf_exempt
    def updateProduct(self, request):
        if request.method == 'POST':
            data = json.loads(request.body)
            productDTO = ProductDTO(**data.get('product', {}))
            code_product = data.get('code_product', '')
            res = self.service.productUpdate(product=productDTO, code_product=code_product).toDict()
            return JsonResponse(res, status=res.get('status', 200))
        else:
            return JsonResponse({'mensage': 'Method not allowed'}, status=405)
        
    @csrf_exempt  
    def returnProduct(self, request):
        if request.method == 'POST':
            data = json.loads(request.body)
            code_product = data.get('code_product', '')
            name = data.get('name', '')
            res = self.service.productReturn(code_product=code_product, name=name).toDict()
            return JsonResponse(res, status=res.get('status', 200))
        else:
            return JsonResponse({'mensage': 'Method not allowed'}, status=405)
        
    @csrf_exempt  
    def listProducts(self, request):
        if request.method == 'GET':
            res = self.service.productList().toDict()
            return JsonResponse(res, status=res.get('status', 200))
        else:
            return JsonResponse({'mensage': 'Method not allowed'}, status=405)
        
    @csrf_exempt  
    def updatePriceProduct(self, request):
        if request.method == 'POST':
            data = json.loads(request.body)
            code_product = data.get('code_product', '')
            name = data.get('name', '')
            price = data.get('price', 0.0)
            res = self.service.productUpdatePrice(code_product=code_product, name=name, price=price).toDict()
            return JsonResponse(res, status=res.get('status', 200))
        else:
            return JsonResponse({'mensage': 'Method not allowed'}, status=405)
        
    @csrf_exempt   
    def deleteProduct(self, request):
        if request.method == 'POST':
            data = json.loads(request.body)
            code_product = data.get('code_product', '')
            res = self.service.productDelete(code_product=code_product).toDict()
            return JsonResponse(res, status=res.get('status', 200))
        else:
            return JsonResponse({'mensage': 'Method not allowed'}, status=405)