from __future__ import annotations
from django.db import models
from constants.productConstants import PRODUCT_TYPE_CHOICES
from Product.models import Product
from datetime import date as Date
import secrets
import string

def generateCodeStock():
    date = Date.today()
    code = 'ST'
    caracters = string.ascii_uppercase + string.digits
    code += date.strftime('%Y')[-2:]
    code += date.strftime('%m')
    code += date.strftime('%d')
    code += ''.join(secrets.choice(caracters) for i in range(3))
    if Stock.objects.filter(code=code).first():
        return generateCodeStock()
    return code

class Stock(models.Model):
    code = models.CharField(
        max_length=20,
        default='Unnamed',
        null=False,
        blank=True
    )
    category = models.CharField(
        max_length=15,
        default='Unnamed',
        null=False,
        blank=True,
        choices=PRODUCT_TYPE_CHOICES
    )
    stove_name = models.CharField(
        max_length=100,
        default='Unnamed',
        null=False,
        blank=True
    )
    date_criated = models.DateTimeField(auto_now_add=True)
    activated = models.BooleanField(
        default=False,
        null=False,
        blank=True
    )
    
    def stockCreate(self, category: str):
        stock = Stock()
        stock.code = generateCodeStock()
        stock.category = category
        stock.activated = True
        stock.save()
        return stock
    
    def stockExists(self, code_stock: str='', category: str=''):
        if code_stock and category:
            return Stock.objects.filter(code=code_stock, category=category).exists()
        if code_stock:
            return Stock.objects.filter(code=code_stock).exists()
        if category:
            return Stock.objects.filter(category=category).exists()
        return None
    
    def stockUpdate(self, stove_name: str, stock_code: str):
        stock_obj = Stock.objects.filter(code=stock_code).first()
        if stove_name and stock_obj and stock_code:
            stock_obj.stove_name = stove_name
            stock_obj.save()
            return stock_obj
        return None
    
    def deactivateStock(self, code_stock):
        if code_stock:
            stock_obj = Stock.objects.filter(code=code_stock).first()
            if stock_obj:
                stock_obj.activated = False
                stock_obj.save()
        return None
    
    def stockDelete(self, stock_code: str):
        if stock_code:
            Stock.objects.filter(code=stock_code).first().delete()
        return None
    
    def stockReturnFromCode(self, stock_code: str):
        return Stock.objects.filter(code=stock_code).first()

    def stockReturnForCategory(self, stock_category: str):
        return Stock.objects.filter(category=stock_category).first()
    
    def stockReturnForStove(self, stove_name: str):
        return list(Stock.objects.filter(stove_name=stove_name).all())
    
    def stockList(self):
        return Stock.objects.all()
    
class StockItem(models.Model):
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name='item', null=False, blank=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stock_item')
    amount = models.IntegerField(
        default=0,
        null=False,
        blank=True
    )
    
    def stockItemCreate(self, code_product: str, code_stock: str):
        if code_product:
            return None
        item = StockItem()
        item.stock = Stock.objects.filter(code=code_stock).first()
        item.product = Product.objects.filter(code=code_product).first()
        item.save()
        return item
        
    def stockItemExists(self, code_product: str):
        product = Product.objects.filter(code=code_product).first()
        return StockItem.objects.filter(product=product).exists()
        
    
    def stockItemUpdate(self, product_code: str,  amount: int):
        product = Product.objects.filter(code=product_code).first()
        stock_item_obj = StockItem.objects.filter(product=product).first()
        if stock_item_obj:
            stock_item_obj.amount = amount
            stock_item_obj.save()
            return stock_item_obj
        return None
    
    def stockItemDelete(self, code_product: str):
        stock_item_obj = self.stockItemReturn(code_product=code_product)
        if stock_item_obj:
            stock_item_obj.delete()
        return None
    
    def stockItemReturn(self, name_product: str='', code_product: str=''):
        if name_product:
            item_obj = StockItem.objects.filter(product__name=name_product).first()
        if code_product:
            item_obj = StockItem.objects.filter(product__code=code_product).first()
        if item_obj:
            return item_obj
        return None
    
    def stockReturnList(self, stock_code: str=''):
        if stock_code:
            return StockItem.objects.filter(stock__code=stock_code)
        return None
    

class Operations(models.Model):
    date_operation = models.DateTimeField(auto_now_add=True)
    item_stock = models.ForeignKey(StockItem, on_delete=models.CASCADE, related_name='operation', null=False, blank=True)
    value_after = models.IntegerField(
        default=0,
        null=False,
        blank=True
    )
    value_before = models.IntegerField(
        default=0,
        null=False,
        blank=True
    )
    
    type_operation = models.CharField(
        max_length=15,
        default='Unnamed',
        null=False,
        blank=True
    )
    
    def operationCreate(self, operation: Operations) -> None:
        if operation:
            operation.save()
            return operation
        return None
    
    def operationsReturn(self, stock_code: str='', code_product: str='', time_interval: dict={}) -> list:
        if stock_code:
            return list(Operations.objects.filter(item_stock__stock__code=stock_code).all())
        if code_product:
            return list(Operations.objects.filter(item_stock__product__code=code_product).all())
        if time_interval:
            return list(Operations.objects.filter(date_operation__range=(time_interval['start'], time_interval['end'])).all())
        if stock_code and code_product:
            return list(Operations.objects.filter(item_stock__stock__code=stock_code, item_stock__product__code=code_product).all())
        if stock_code and time_interval:
            return list(Operations.objects.filter(item_stock__stock__code=stock_code,
            date_operation__range=(time_interval['start'], time_interval['end'])).all())
        if code_product and time_interval:
            return list(Operations.objects.filter(item_stock__product__code=code_product, 
            date_operation__range=(time_interval['start'], time_interval['end'])).all())
        if stock_code and code_product and time_interval:
            return list(Operations.objects.filter(item_stock__stock__code=stock_code, item_stock__product__code=code_product,
            date_operation__range=(time_interval['start'], time_interval['end'])).all())
        return list(Operations.objects.all()) 