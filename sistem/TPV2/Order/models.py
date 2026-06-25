from __future__ import annotations
from Client.models import Client
from Product.models import Product
from datetime import date as Date
import string
import secrets
from constants.orderConstantes import STATUS_ORDER_CHOICES
from django.db import models

def generateOrderCode():
    date = Date.today()
    code = 'PD'
    caracters = string.ascii_uppercase + string.digits
    code += date.strftime('%Y')[-2:]
    code += date.strftime('%m')
    code += date.strftime('%d')
    code += ''.join(secrets.choice(caracters) for i in range(3))
    if Order.objects.filter(code=code).first():
        return generateOrderCode()
    return code


def generateSnapshotCode():
    caracters = string.ascii_uppercase + string.digits
    code = 'SN' + ''.join(secrets.choice(caracters) for i in range(8))
    if Snapshot.objects.filter(code=code).first():
        return generateSnapshotCode()
    return code

class Snapshot(models.Model):
    code = models.CharField(max_length=20, null=False, blank=False, unique=True)
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='snapshot')
    price = models.FloatField(default=0.0)
    discount = models.FloatField(default=0.0)
    
    def saveSnapshot(self, code_product: str, price: float):
        product = Product.objects.filter(code=code_product).first()
        snapshot = Snapshot()
        snapshot.code = generateSnapshotCode()
        snapshot.product = product
        snapshot.price = price
        snapshot.save()
        return snapshot
        
    def updateSnapshot(self, code_snapshot: str, price: float, discount: float):
        snapshot = Snapshot.objects.filter(code=code_snapshot).first()
        if snapshot:
            snapshot.price = price
            snapshot.discount = discount
            snapshot.save()
            return snapshot
        return None
    

class Order(models.Model):
    code = models.CharField(
        max_length=20,
        null=False,
        blank=False,
        unique=True
    )
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='pedido')
    date_created = models.DateField(auto_now_add=True)
    status = models.CharField(
        max_length=30,
        null=False,
        blank=False,
        choices=STATUS_ORDER_CHOICES,
        default='PENDENTE'
    )
    
    def createOrder(self, code_client: str):
        if not code_client:
            return None
        client = Client.objects.filter(code=code_client).first()
        order = Order()
        order.client = client
        order.code = generateOrderCode()
        order.save()
        return order
    
    def orderExists(self, code_order: str):
        if not code_order:
            return None
        return Order.objects.filter(code=code_order).exists()
        
    def deleteOrder(self, code_order: str):
        if code_order:
            order = Order.objects.filter(code=code_order).first()
            order.delete()
        return None
    
    def updateOrder(self, code_order: str):
        if code_order:
            order = Order.objects.filter(code=code_order).first()
            order.status = 'PARCIALMENTE ATENDIDO'
            order.save()
            return order
        return None
    
    def returnOrder(self, time_interval: dict={}, status: str='', code_client: str=''):
        orders = Order.objects.all()
        if time_interval:
            orders = orders.filter(date_created__range=(time_interval['start'], time_interval['end']))
        if status:
            orders = orders.filter(status=status)
        if code_client:
            orders = orders.filter(client__code=code_client)
        return list(orders)
        
    def listAllOrders(self):
        return list(Order.objects.all())
        
    def getOrderByCode(self, code_order: str):
        if code_order:
            return Order.objects.filter(code=code_order).first()
        return None
    
    
class OrderItem(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='order_item_of_product')
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_item_of_order')
    amount = models.IntegerField(default=0, null=False, blank=True)
    price = models.FloatField(default=0.0)
    discount = models.FloatField(default=0.0)
    
    def saveItem(self, code_order: str, code_product: str, amount: int):
        order = Order.objects.filter(code=code_order).first()
        product = Product.objects.filter(code=code_product).first()
        snapshot = Snapshot.objects.filter(product=product).first()
        snapshot_price = snapshot.price if snapshot else product.price
        snapshot_discount = snapshot.discount if snapshot else 0.0
        
        item = OrderItem.objects.filter(order=order, product=product).first()
        if not item:
            item = OrderItem()
            item.order = order
            item.product = product
            
        item.amount = amount
        item.price = snapshot_price
        item.discount = snapshot_discount
        item.save()
        return item
    
    def returnItem(self, code_order: str):
        order = Order.objects.filter(code=code_order).first()
        return list(OrderItem.objects.filter(order=order))
            
    def updateItem(self, code_order: str, code_product: str, amount: int):
        order = Order.objects.filter(code=code_order).first()
        product = Product.objects.filter(code=code_product).first()
        item = OrderItem.objects.filter(order=order, product=product).first()
        if item:
            item.amount += amount
            item.save()
            return item
        return None