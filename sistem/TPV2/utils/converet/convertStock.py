from Stock.models import Stock, StockItem, Operations

class ConvertStock:
    def toDict(self, stock: Stock):
        return {
            "code": stock.code,
            "category": stock.category,
            "date_criated": stock.date_criated,
            "products_licensed": stock.products_licensed
        }

class ConvertStockItem:
    def toDict(self, stock_item: StockItem):
        return {
            "product_name": stock_item.product.name,
            "product_code": stock_item.product.code,
            "amount": stock_item.amount
        }
    
class ConvertOperations:
    def toDict(self, operations: Operations):
        return {
            'date_operation': operations.date_operation,
            'name_product': operations.item_stock.product.name,
            'code_product': operations.item_stock.product.code,
            'stock_code': operations.item_stock.stock.code,
            'value_after': operations.value_after,
            'value_before': operations.value_before,
            'type_operation': operations.type_operation
        }