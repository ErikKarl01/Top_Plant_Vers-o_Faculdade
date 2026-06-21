from utils.validate import Validate, MENSAGE_SUCESS
from Stock.models import StockItem
from Product.models import Product
from constants.stockConstants import Errors, Success
from constants.productConstants import Errors as PERRO
from constants.responseClass import Response

class StockItemService:
    validate = Validate()
    i_model = StockItem()
    product = Product()

    def stockItemCreate(self, code_product: str, code_stock: str) -> Response:
        mens_code = self.validate.validateCode(code_product)
        if mens_code != MENSAGE_SUCESS:
            return Response().erroMens(menssage=mens_code, status=400)
            
        if not self.product.productExists(code_product=code_product):
            return Response().erroMens(menssage=PERRO.PRODUCT_NOT_FOUND, status=404)
            
        if self.i_model.stockItemExists(code_product=code_product):
            return Response().erroMens(menssage=Errors.STOCK_ITEM_ALREADY_EXISTS, status=409)
            
        try:
            item_model = self.i_model.stockItemCreate(code_product=code_product, code_stock=code_stock)
        except Exception:
            return Response().erroMens(menssage=Errors.MODELS_OPERATION, status=500)
            
        return Response().sucessMens(mensage=Success.STOCK_ITEM_CREATED, value=item_model)


    def stockItemUpdateAmount(self, product_code: str, operation_type: str, amount_changed: int) -> Response:
        mens_amount = self.validate.Stock.amount(val=amount_changed)
        mens_code = self.validate.validateCode(product_code)
        mensages_erro = []
        
        if mens_amount != MENSAGE_SUCESS:
            mensages_erro.append(mens_amount)
        if mens_code != MENSAGE_SUCESS:
            mensages_erro.append(mens_code)
        if mensages_erro:
            return Response().erroMens(menssage=mensages_erro, status=400)
            
        item_model = self.i_model.stockItemReturn(code_product=product_code)
        if not item_model:
            return Response().erroMens(menssage=Errors.STOCK_NOT_FOUND, status=404)
            
        current_amount = item_model.amount
        new_amount = current_amount
        
        if operation_type == 'REMOCAO':
            new_amount = current_amount - amount_changed
            if new_amount < 0:
                return Response().erroMens(menssage="Erro: Quantidade não pode ficar negativa.", status=400)
        elif operation_type == 'ADICAO':
            new_amount = current_amount + amount_changed
            if new_amount > 1000000:
                return Response().erroMens(menssage="Erro: Quantidade ultrapassa limite de 1000000.", status=400)
        else:
            return Response().erroMens(menssage="Operação inválida. Use ADICAO ou REMOCAO.", status=400)
            
        try:
            updated_item = self.i_model.stockItemUpdate(product_code=product_code, amount=new_amount)
        except Exception:
            return Response().erroMens(menssage=Errors.MODELS_OPERATION, status=500)
            
        value_return = {'item': updated_item, 'before_value': current_amount}
        return Response().sucessMens(mensage=Success.STOCK_ITEM_UPDATED, value=value_return)


    def stockItemDelete(self, code_product: str) -> Response:
        mens_code = self.validate.validateCode(code_product)
        if mens_code != MENSAGE_SUCESS:
            return Response().erroMens(menssage=mens_code, status=400)
            
        if not self.i_model.stockItemExists(code_product=code_product):
            return Response().erroMens(menssage=Errors.STOCK_NOT_FOUND, status=404)
            
        try:
            self.i_model.stockItemDelete(code_product=code_product)
        except Exception:
            return Response().erroMens(menssage=Errors.MODELS_OPERATION, status=500)
            
        return Response().sucessMens(mensage=Success.STOCK_ITEM_DELETED, value=None)


    def stockItemReturnList(self, stock_code: str) -> Response:
        mens_code = self.validate.Stock.code(val=stock_code)
        if mens_code != MENSAGE_SUCESS:
            return Response().erroMens(menssage=mens_code, status=400)
            
        try:
            items_model = self.i_model.stockReturnList(stock_code=stock_code)
        except Exception:
            return Response().erroMens(menssage=Errors.MODELS_OPERATION, status=500)
            
        return Response().sucessMens(mensage=Success.STOCK_ITEM_RETURNED, value=items_model)