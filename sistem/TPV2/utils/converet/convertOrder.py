from Order.models import Order, OrderItem

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