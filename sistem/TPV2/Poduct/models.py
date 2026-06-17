from __future__ import annotations
from django.db import models

class Product (models.Model):
    code = models.CharField(
        max_length=10,
        null=False,
        blank=False,
        unique=True
    )
    name = models.CharField(
        max_length=255, 
        null=False,
        blank=False,
        unique=True
    )
    price = models.FloatField(
        null=False,
        blank=False
    )
    description = models.CharField(
        max_length=255
    )
    type = models.CharField(
        max_length=20,
        null=False,
        blank=False
    )
    measure = models.CharField(
        max_length=10,
        null=False,
        blank=False
    )
    licensed = models.BooleanField(
        null=False,
        blank=False
    )
    
    def productSave(self, product: Product):
        if product:
            product.save()
            return product
        return None
    
    def nametAlreadyRegistered(self, name: str):
        if name:
            return Product.objects.filter(name=name).exists()
        return False
    
    def productExists(self, code_product: str):
        if code_product:
            return Product.objects.filter(code=code_product).exists()
        return False
    
    def productUpdate(self, product: Product, code_product: str):
        if product and code_product:
            product_obj = Product.objects.filter(code=code_product).first()
            product_obj.code = product.code
            product_obj.name = product.name
            product_obj.price = product.price
            product_obj.type = product.type
            product_obj.measure = product.measure
            product_obj.description = product.description
            product_obj.licensed = product.licensed
            product_obj.save()
            return product_obj
        return None
        
    
    def productDelete(self, code_product: str):
        if code_product:
            Product.objects.filter(code=code_product).first().delete()
        return None
    
    def productReturn(self, code_product: str='', name: str=''):
        if code_product:
            return Product.objects.filter(code=code_product).first()
        if name:
            return Product.objects.filter(name=name).first()
        return None
    
    def productList(self):
        products = Product.objects.all()
        if products:
            return list(products)
        return None
    
    def productUpdatePrice(self, code_product: str='', name: str='', price: float=0.0):
        product = self.productReturn(code_product=code_product, name=name)
        if product and price:
            product.price = price
            product.save()
            return product
        return None