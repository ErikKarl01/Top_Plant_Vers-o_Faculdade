from __future__ import annotations
from django.db import models
from constants.productConstants import PRODUCT_TYPE_CHOICES
from constants.stockConstants import STOCK_OPERATIONS_CHOICES
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
        unique=True,
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
    date_criated = models.DateTimeField(auto_now_add=True)
    products_licensed = models.BooleanField(default=True, null=False, blank=False)
    
    def stockCreate(self, category: str, products_licensed: bool):
        stock = Stock()
        stock.code = generateCodeStock()
        stock.category = category
        stock.products_licensed = products_licensed
        stock.save()
        return stock
    
    def stockExists(self, category: str, products_licensed: bool):
        return Stock.objects.filter(category=category, products_licensed=products_licensed).exists()

    def stockReturnForCategory(self, stock_category: str, products_licensed: bool):
        return Stock.objects.filter(category=stock_category, products_licensed=products_licensed).first()
    
    def stockList(self):
        return Stock.objects.all()
    
class StockItem(models.Model):
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name='item', null=True, blank=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stock_item')
    amount = models.IntegerField(
        default=0,
        null=False,
        blank=True
    )
    
    def returItemAmount(self, code_product: str):
        product = Product.objects.filter(code=code_product).first()
        item = StockItem.objects.filter(product=product).first()
        if item:
            return item.amount
        return 0
    
    def stockItemCreate(self, code_product: str, code_stock: str):
        if not code_product or not code_stock:
            return None
        item = StockItem()
        item.product = Product.objects.filter(code=code_product).first()
        item.stock = Stock.objects.filter(code=code_stock).first()
        item.save()
        return item
        
    def stockItemExists(self, code_product: str):
        product = Product.objects.filter(code=code_product).first()
        return StockItem.objects.filter(product=product).exists()
        
    
    def removeAmount(self, product_code: str,  amount: int):
        product = Product.objects.filter(code=product_code).first()
        stock_item_obj = StockItem.objects.filter(product=product).first()
        if stock_item_obj:
            stock_item_obj.amount -= amount
            stock_item_obj.save()
            return stock_item_obj
        return None
    
    def addAmount(self, product_code: str,  amount: int):
        product = Product.objects.filter(code=product_code).first()
        stock_item_obj = StockItem.objects.filter(product=product).first()
        if stock_item_obj:
            stock_item_obj.amount += amount
            stock_item_obj.save()
            return stock_item_obj
        return None
    
    def stockItemReturn(self, name_product: str='', code_product: str=''):
        if name_product:
            item_obj = StockItem.objects.filter(product__name=name_product).first()
            return item_obj
        if code_product:
            item_obj = StockItem.objects.filter(product__code=code_product).first()
            return item_obj
        return None
    
    def stockItemsList(self, stock_code: str=''):
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
        choices=STOCK_OPERATIONS_CHOICES,
        null=False,
        blank=False
    )
    
    def operationCreate(self, code_product: str, operation_type: str, value_after: int=0, value_before: int=0) -> None:
        operation = Operations()
        item_obj = StockItem.objects.filter(product__code=code_product).first()
        operation.item_stock = item_obj  
        operation.type_operation = operation_type
        if value_after and value_before:
            operation.value_after = value_after
            operation.value_before = value_before
        operation.save()
    
    def operationsReturn(self, stock_code: str='', code_product: str='', time_interval: dict={}) -> list:
        filters = {}
        if stock_code:
            filters['item_stock__stock__code'] = stock_code
            
        if code_product:
            filters['item_stock__product__code'] = code_product
            
        if time_interval and 'start' in time_interval and 'end' in time_interval:
            filters['date_operation__date__range'] = (time_interval['start'], time_interval['end'])

        return list(Operations.objects.filter(**filters))