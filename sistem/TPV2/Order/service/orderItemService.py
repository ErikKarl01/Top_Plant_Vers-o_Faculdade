from utils.validate import Validate, MENSAGE_SUCESS
from Order.models import Order, OrderItem
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
    
    def saveItem(self, code_product: str, price_product: float):
        mens_code = self.validate.validateCode(code_product)
        mens_price = self.validateOrder.validateFloat(price_product)
        mens_erro = []
        if mens_code != MENSAGE_SUCESS:
            mens_erro.append(mens_code)
        if mens_price != MENSAGE_SUCESS:
            mens_erro.append(mens_price)
        if mens_erro:
            return self.response.erroMens(menssage=mens_erro, status=400)
        if not self.p_model.productExists(code_product=code_product):
            return self.response.erroMens(menssage=ERROSPRO.PRODUCT_NOT_FOUND, status=400)
        try:
            item_model = self.i_model.saveItem(code_product=code_product, price_product=price_product)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.MODELS_ERROR, str(e)], status=500)
        return self.response.sucessMens(menssage=Success.ITEM_ORDER_CREATED_SUCEFULD, value=item_model)
    
    def returnItem(self, code_order: str):
        mens_code = self.validateOrder.code(code_order)
        if mens_code != MENSAGE_SUCESS:
            return self.response.erroMens(menssage=mens_code, status=400)
        if not self.o_model.orderExists(code_order=code_order):
            return self.response.erroMens(menssage=Errors.ORDER_DONT_EXISTS, status=400)
        try:
            item_model = self.i_model.returnItem(code_order=code_order)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.MODELS_ERROR, str(e)], status=500)
        return self.response.sucessMens(menssage=Success.ITEM_ORDER_RETURNED_SUCEFULD, value=item_model)
    
    
    def updateItem(self, code_product: str, price_product: float, discount: float):
        mens_code = self.validate.validateCode(code_product)
        mens_price = self.validateOrder.validateFloat(price_product)
        mens_discount = self.validateOrder.validateFloat(discount)
        mens_erro = []
        if mens_code != MENSAGE_SUCESS:
            mens_erro.append(mens_code)
        if mens_price != MENSAGE_SUCESS:
            mens_erro.append(mens_price)
        if mens_discount != MENSAGE_SUCESS:
            mens_erro.append(mens_discount)
        if mens_erro:
            return self.response.erroMens(menssage=mens_erro, status=400)
        if price_product <= discount:
            return self.response.erroMens(menssage=Errors.DICOUNT_BIGGER_PRICE, status=400)
        if not self.p_model.productExists(code_product=code_product):
            return self.response.erroMens(menssage=ERROSPRO.PRODUCT_NOT_FOUND, status=400)
        try:
            item_model = self.i_model.updateItem(code_product=code_product, price_product=price_product, discount=discount)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.MODELS_ERROR, str(e)], status=500)
        return self.response.sucessMens(menssage=Success.ITEM_ORDER_MODIFIED_SUCEFULD, value=item_model)
    
    def updateForOrderItem(self, code_order: str, code_product: str):
        mens_code_ord = self.validateOrder.code(code_order)
        mens_code_prod = self.validate.validateCode(code_product)
        mensages_erro = []
        if mens_code_ord != MENSAGE_SUCESS:
            mensages_erro.append(mens_code_ord)
        if mens_code_prod != MENSAGE_SUCESS:
            mensages_erro.append(mens_code_prod)
        if mensages_erro:
            return self.response.erroMens(menssage=mensages_erro, status=400)
        if not self.p_model.productExists(code_product=code_product):
            return self.response.erroMens(menssage=ERROSPRO.PRODUCT_NOT_FOUND, status=400)
        if not self.o_model.orderExists(code_order=code_order):
            return self.response.erroMens(menssage=Errors.ORDER_DONT_EXISTS, status=400)
        try:
            item_model = self.i_model.updateForOrderItem(code_order=code_order, code_product=code_product)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.MODELS_ERROR, str(e)], status=500)
        return self.response.sucessMens(menssage=Success.ITEM_ORDER_MODIFIED_SUCEFULD, value=item_model)