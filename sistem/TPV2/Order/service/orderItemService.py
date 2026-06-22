from utils.validate import Validate, MENSAGE_SUCESS
from Order.models import OrderItem, Order
from Product.models import Product
from constants.responseClass import Response
from constants.orderConstantes import Errors, Success
from constants.productConstants import Errors as ERROSPRO

class OrderItemService:
    o_model = Order()
    p_model = Product()
    i_model = OrderItem()
    validateOrder = Validate().Oder()
    validate = Validate()
    response = Response()
    
    def saveItem(self, code_order: str, code_product: str, amount: int):
        mens_code_ord = self.validateOrder.code(code_order)
        mens_code_prod = self.validate.validateCode(code_product)
        mens_amount = self.validateOrder.validateInt(amount) if hasattr(self.validateOrder, 'validateInt') else MENSAGE_SUCESS
        
        mens_erro = []
        if mens_code_ord != MENSAGE_SUCESS: mens_erro.append(mens_code_ord)
        if mens_code_prod != MENSAGE_SUCESS: mens_erro.append(mens_code_prod)
        if mens_amount != MENSAGE_SUCESS: mens_erro.append(mens_amount)
        if mens_erro: return self.response.erroMens(menssage=mens_erro, status=400)
            
        if not self.o_model.orderExists(code_order=code_order):
            return self.response.erroMens(menssage=Errors.ORDER_DONT_EXISTS, status=400)
        if not self.p_model.productExists(code_product=code_product):
            return self.response.erroMens(menssage=ERROSPRO.PRODUCT_NOT_FOUND, status=400)
            
        try:
            item_model = self.i_model.saveItem(code_order=code_order, code_product=code_product, amount=amount)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.MODELS_ERROR, str(e)], status=500)
        return self.response.sucessMens(mensage=Success.ITEM_ORDER_CREATED_SUCEFULD, value=item_model)

    def updateItem(self, code_order: str, code_product: str, amount: int):
        mens_code_ord = self.validateOrder.code(code_order)
        mens_code_prod = self.validate.validateCode(code_product)
        mens_amount = self.validateOrder.validateInt(amount) if hasattr(self.validateOrder, 'validateInt') else MENSAGE_SUCESS
        
        mens_erro = []
        if mens_code_ord != MENSAGE_SUCESS: mens_erro.append(mens_code_ord)
        if mens_code_prod != MENSAGE_SUCESS: mens_erro.append(mens_code_prod)
        if mens_amount != MENSAGE_SUCESS: mens_erro.append(mens_amount)
        if mens_erro: return self.response.erroMens(menssage=mens_erro, status=400)
            
        if not self.o_model.orderExists(code_order=code_order):
            return self.response.erroMens(menssage=Errors.ORDER_DONT_EXISTS, status=400)
        if not self.p_model.productExists(code_product=code_product):
            return self.response.erroMens(menssage=ERROSPRO.PRODUCT_NOT_FOUND, status=400)
        
        try:
            item_model = self.i_model.updateItem(code_order=code_order, code_product=code_product, amount=amount)
            if not item_model:
                 return self.response.erroMens(menssage=Errors.ITEM_NOT_FOUND, status=400)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.MODELS_ERROR, str(e)], status=500)
        return self.response.sucessMens(mensage=Success.ITEM_ORDER_MODIFIED_SUCEFULD, value=item_model)

    def returnItem(self, code_order: str):
        mens_code = self.validateOrder.code(code_order)
        if mens_code != MENSAGE_SUCESS:
            return self.response.erroMens(menssage=mens_code, status=400)
        if not self.o_model.orderExists(code_order=code_order):
            return self.response.erroMens(menssage=Errors.ORDER_DONT_EXISTS, status=400)
        try:
            items_list = self.i_model.returnItem(code_order=code_order)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.MODELS_ERROR, str(e)], status=500)
        return self.response.sucessMens(mensage=Success.ITEM_ORDER_RETURNED_SUCEFULD, value=items_list)