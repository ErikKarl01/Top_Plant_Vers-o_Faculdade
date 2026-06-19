from __future__ import annotations
from django.db import models
from constants.productConstants import PRODUCT_CATEGORY_CHOICES
from datetime import date as Date
import secrets
import string

def generateCodeStock(stove_name: str):
    date = Date.today()
    code = 'ST'
    code += stove_name[:3].upper()
    caracters = string.ascii_uppercase + string.digits
    code += date.strftime('%Y')[-2:]
    code += date.strftime('%m')
    code += date.strftime('%d')
    code += ''.join(secrets.choice(caracters) for i in range(3))
    if Stock.objects.filter(code=code).first():
        return generateCodeStock(date, stove_name)
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
        choices=PRODUCT_CATEGORY_CHOICES
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
    
    def stockCreate(self, stock: Stock):
        if stock:
            stock.save()
            return stock
        return None
    
    def stockUpdate(self, stock: Stock, ):
        stock_obj = Stock.objects.filter(id=stock.id).first()
        if stock and stock_obj:
            stock_obj.category = stock.category
            stock_obj.stove_name = stock.stove_name
            stock_obj.code = generateCodeStock(stock.stove_name)
            stock_obj.activated = stock.activated
            stock_obj.save()
            return stock
        return None
    
    def stockDelete(self, stock_code: str):
        if stock_code:
            Stock.objects.filter(code=stock_code).first().delete()
        return None
    
    def stockReturnFromCode(self, stock_code: str):
        return Stock.objects.filter(code=stock_code).first()

    def stockReturnForCategory(self, stock_category: str):
        return Stock.objects.filter(category=stock_category)
    
    def stockReturnForStove(self, stove_name: str):
        return Stock.objects.filter(stove_name=stove_name)
    
    def stockList(self):
        return Stock.objects.all()
    
class StockItem(models.Model):
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name='item', null=False, blank=True)
    product = models.ForeignKey('Product.Product', on_delete=models.CASCADE, related_name='stock_item')
    amount = models.IntegerField(
        max_digits=10,
        default=0,
        null=False,
        blank=True
    )
    
    def stockItemCreate(self, stock_item: StockItem):
        if stock_item:
            stock_item.save()
            return stock_item
        return None
    
    def stockItemUpdate(self, stock_item: StockItem):
        stock_item_obj = StockItem.objects.filter(id=stock_item.id).first()
        if stock_item and stock_item_obj:
            stock_item_obj.stock = stock_item.stock
            stock_item_obj.product = stock_item.product
            stock_item_obj.save()
            return stock_item
        return None
    
    def stockItemUpdateAmount(self, stock_item: StockItem, amount: int):
        stock_item_obj = StockItem.objects.filter(id=stock_item.id).first()
        if stock_item_obj:
            stock_item_obj.amount = amount
            stock_item_obj.save()
            return stock_item_obj
        return None
    
    def stockItemDelete(self, stock_item: StockItem):
        stock_item_obj = self.stockItemReturn(stock_item.product.code, stock_item.stock.code)
        if stock_item_obj:
            stock_item_obj.delete()
        return None
    
    def stockItemReturn(self, name_product: str='', code_product: str='', stock_code: str=''):
        if name_product:
            item_obj = StockItem.objects.filter(product__name=name_product).first()
        if code_product:
            item_obj = StockItem.objects.filter(product__code=code_product).first()
        if stock_code:
            item_obj = StockItem.objects.filter(stock__code=stock_code).first()
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
    value = models.IntegerField(
        max_digits=10,
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
    
    def operationCreate(self, operation: Operations):
        if operation:
            operation.save()
            return operation
        return None
    
    def operationsReturn(self, stock_code: str='', code_product: str='', time_interval: dict={}):
        if stock_code:
            return Operations.objects.filter(item_stock__stock__code=stock_code).all()
        if code_product:
            return Operations.objects.filter(item_stock__product__code=code_product).all()
        if time_interval:
            return Operations.objects.filter(date_operation__range=(time_interval['start'], time_interval['end'])).all()
        if stock_code and code_product:
            return Operations.objects.filter(item_stock__stock__code=stock_code, item_stock__product__code=code_product).all()
        if stock_code and time_interval:
            return Operations.objects.filter(item_stock__stock__code=stock_code,
            date_operation__range=(time_interval['start'], time_interval['end'])).all()
        if code_product and time_interval:
            return Operations.objects.filter(item_stock__product__code=code_product, 
            date_operation__range=(time_interval['start'], time_interval['end'])).all()
        if stock_code and code_product and time_interval:
            return Operations.objects.filter(item_stock__stock__code=stock_code, item_stock__product__code=code_product,
            date_operation__range=(time_interval['start'], time_interval['end'])).all()
        return None 