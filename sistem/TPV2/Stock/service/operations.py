from Stock.models import Operations, StockItem
from constants.stockConstants import Errors, Success
from constants.responseClass import Response

class OperationsService:
    o_model = Operations()

    def operationCreate(self, item_stock: StockItem, amount: int, before_value: int, type_operation: str) -> Response:
        operation = Operations(
            item_stock=item_stock,
            value_after=amount,
            value_before=before_value,
            type_operation=type_operation
        )
        try:
            operation_model = self.o_model.operationCreate(operation=operation)
        except Exception:
            return Response().erroMens(menssage=Errors.MODELS_OPERATION, status=500)
            
        return Response().sucessMens(mensage=Success.OPERATION_CREATED, value=operation_model)


    def operationsReturnList(self, stock_code: str='', code_product: str='', time_interval: dict={}) -> Response:
        try:
            operations_model = self.o_model.operationsReturn(stock_code=stock_code, code_product=code_product, time_interval=time_interval)
        except Exception:
            return Response().erroMens(menssage=Errors.MODELS_OPERATION, status=500)
            
        return Response().sucessMens(mensage=Success.OPERATION_RETURNED, value=operations_model)