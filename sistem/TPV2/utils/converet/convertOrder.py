from Order.models import Order, OrderItem, Snapshot

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
            'original_amount': item.original_amount,
            'amount': item.amount,
            'price': item.price,
            'discount': item.discount,
            'measure': item.product.measure
        }
        
class ConvertSnapshot:
    def toDict(self, snapsot: Snapshot):
        return {
            'code': snapsot.code,
            'product_code': snapsot.product.code,
            'product_code_name': snapsot.product.name,
            'price': snapsot.price,
            'discount': snapsot.discount,
            'measure': snapsot.product.measure
        }  