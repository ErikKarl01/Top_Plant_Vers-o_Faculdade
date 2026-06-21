from Stock.models import Stock, StockItem, Operations
from Stock.dto import StockDTO, StockItemDTO, OperationsDTO

class ConvertStock:
    
    def toModel(self):
        return Stock()
    
    def toDTO(self, stock: Stock):
        return StockDTO(
            code=stock.code,
            category=stock.category,
            stove_name=stock.stove_name,
            date_criated=stock.date_criated,
            activated=stock.activated
        )
    
    def toDict(self, stock: Stock):
        return {
            "code": stock.code,
            "category": stock.category,
            "stove_name": stock.stove_name,
            "date_criated": stock.date_criated,
            "activated": stock.activated
        }

class ConvertStockItem:
    
    def toModel(self):
        return StockItem()
    
    def toDTO(self, stock_item: StockItem):
        return StockItemDTO(
            product_name=stock_item.product.name,
            product_code=stock_item.product.code,
            amount=stock_item.amount
        )

    def toDict(self, stock_item: StockItem):
        return {
            "product_name": stock_item.product.name,
            "product_code": stock_item.product.code,
            "amount": stock_item.amount
        }
    
class ConvertOperations:
    
    def toModel(self, operations_dto: OperationsDTO):
        return Operations(
            value_after=operations_dto.value_after,
            value_before=operations_dto.value_before,
            type_operation=operations_dto.type_operation
        )
    
    def toDTO(self, operations: Operations):
        return OperationsDTO(
            date_operation = operations.date_operation,
            name_product = operations.item_stock.product.name,
            code_product = operations.item_stock.product.code,
            stock_code = operations.item_stock.stock.code,
            value_after = operations.value_after,
            value_before = operations.value_before,
            type_operation = operations.type_operation
        )
    
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