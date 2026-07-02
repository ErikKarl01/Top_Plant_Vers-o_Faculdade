from Order.models import Order, OrderItem, Snapshot
from Order.dto import OrderItemDTO

class ConvertOrder:
    def toDict(self, order: Order):
        return{
            'code': order.code,
            'date': order.date_created,
            'client_code': order.client.code,
            'client_name':  order.client.name,
            'status': order.status
        }
    
class ConvertOrderItem:
    def toDict(self, item: OrderItem):
        return {
            'product_name': item.product.name,
            'product_code': item.product.code,
            'amount': item.amount,
            'price': item.price,
            'discount': item.discount
        }
        
    def toDTO(item: dict):
        return OrderItemDTO(
            amount=item.get('amount'),
            discount=item.get('product_code')
        )
        
class ConvertSnapshot:
    def toDict(self, snapsot: Snapshot):
        return {
            'code': snapsot.code,
            'product_code': snapsot.product.code,
            'product_code_name': snapsot.product.name,
            'price': snapsot.price,
            'discount': snapsot.discount
        }  