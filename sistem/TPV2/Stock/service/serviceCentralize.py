from utils.toClean import ToClean
from utils.converet.convertStock import ConvertStock, ConvertOperations, ConvertStockItem
from constants.responseClass import Response
from constants.stockConstants import Errors

from Stock.service.stockService import StockService
from Stock.service.stockItemService import StockItemService
from Stock.service.operations import OperationsService

def cleanStockData(stove_name: str, stock_code: str):
    clean = ToClean()
    return {
        'stove_name': clean.name(stove_name),
        'stock_code': clean.alphaNumeric(stock_code)
    }


class ServiceCentralize:
    stock_service = StockService()
    item_service = StockItemService()
    operations_service = OperationsService()
    
    convert_stock = ConvertStock()
    convert_items = ConvertStockItem()
    convert_operations = ConvertOperations()
    response = Response()
    errors = Errors()

    def createItemStockResponse(self, code_product: str, type_product: str) -> Response:
        response_stock = self.stock_service.stockReturnByCategory(category=type_product)
        if not response_stock.sucess and response_stock.status == 404:
            response_stock = self.stock_service.stockCreate(category=type_product)
            if not response_stock.sucess:
                return response_stock.toDict()
                
        elif not response_stock.sucess:
            return response_stock.toDict()
            
        stock_model = response_stock.value
        
        response_item = self.item_service.stockItemCreate(code_product=code_product, code_stock=stock_model.code)
        
        if not response_item.sucess:
            return response_item.toDict()
            
        item_model = response_item.value
        
        try:
            item_dict = self.convert_items.toDict(stock_item=item_model)
        except Exception:
            return self.response.erroMens(menssage=self.errors.CONVERSION_ERROR, status=500).toDict()
            
        response_item.value = item_dict
        return response_item


    def returnStockWithItemsResponse(self, stock_code: str):
        response_stock = self.stock_service.stockReturnByCode(stock_code=stock_code)
        
        if not response_stock.sucess:
            return response_stock.toDict()
            
        stock_model = response_stock.value
        response_items = self.item_service.stockItemReturnList(stock_code=stock_code)
        
        if not response_items.sucess:
            return response_items.toDict()
            
        try:
            stock_dict = self.convert_stock.toDict(stock=stock_model)
            items_model = response_items.value
            items_dict_list = [self.convert_items.toDict(stock_item=item) for item in items_model] if items_model else []
        except Exception:
            return self.response.erroMens(menssage=self.errors.CONVERSION_ERROR, status=500).toDict()
            
        stock_dict['items'] = items_dict_list
        response_stock.value = stock_dict
        return response_stock.toDict()


    def modifyStockResponse(self, stove_name: str, stock_code: str):
        cleaned_data = cleanStockData(stove_name=stove_name, stock_code=stock_code)
        
        response_stock = self.stock_service.stockModify(
            stove_name=cleaned_data['stove_name'], 
            stock_code=cleaned_data['stock_code']
        )
        
        if not response_stock.sucess:
            return response_stock.toDict()
            
        stock_model = response_stock.value
        
        try:
            stock_dict = self.convert_stock.toDict(stock=stock_model)
        except Exception:
            return self.response.erroMens(menssage=self.errors.CONVERSION_ERROR, status=500).toDict()
            
        response_stock.value = stock_dict
        return response_stock.toDict()


    def updateAmountAndLogResponse(self, product_code: str, operation_type: str, amount_changed: int):
        response_item = self.item_service.stockItemUpdateAmount(
            product_code=product_code, 
            operation_type=operation_type, 
            amount_changed=amount_changed
        )
        
        if not response_item.sucess:
            return response_item.toDict()
            
        item_data = response_item.value
        updated_item = item_data['item']
        before_value = item_data['before_value']
        
        response_operation = self.operations_service.operationCreate(
            item_stock=updated_item,
            amount=updated_item.amount,
            before_value=before_value,
            type_operation=operation_type
        )
        
        if not response_operation.sucess:
            return response_operation.toDict()
            
        operation_model = response_operation.value
        
        try:
            operation_dict = self.convert_operations.toDict(operations=operation_model)
        except Exception:
            return self.response.erroMens(menssage=self.errors.CONVERSION_ERROR, status=500).toDict()
            
        response_operation.value = operation_dict
        return response_operation.toDict()


    def deleteStockResponse(self, stock_code: str):
        response_stock = self.stock_service.stockDelete(stock_code=stock_code)
        
        if not response_stock.sucess:
            return response_stock.toDict()
            
        return response_stock.toDict()


    def deleteStockItemResponse(self, code_product: str):
        response_item = self.item_service.stockItemDelete(code_product=code_product)
        
        if not response_item.sucess:
            return response_item.toDict()
            
        return response_item.toDict()