from utils.validate import Validate, MENSAGE_SUCESS
from Order.models import Order
from Client.models import Client
from constants.responseClass import Response
from constants.orderConstantes import Errors, Success
from constants.clientConstants import Errors as ERROSCLI
from utils.toClean import ToClean

class OrderService:
    o_model = Order()
    c_model = Client()
    validateOrder = Validate().Oder()
    validate = Validate()
    response = Response()
    clean_date = ToClean()
    
    def createOrder(self, code_client: str):
        mens_code = self.validate.validateCode(code_client)
        if mens_code != MENSAGE_SUCESS:
            return self.response.erroMens(menssage=mens_code, status=400)
        if not self.c_model.clientExists(code_client=code_client):
            return self.response.erroMens(menssage=ERROSCLI.CLIENT_NOT_FOUND, status=400)
        try:
            order_model = self.o_model.createOrder(code_client=code_client)
        except Exception as e: 
            return self.response.erroMens(menssage=[Errors.MODELS_ERROR, str(e)], status=500)
        return self.response.sucessMens(mensage=Success.ORDER_CREATED_SUCEFULD, value=order_model)
    
    def listOrder(self):
        try:
            order_model = self.o_model.listAllOrders()
        except Exception as e: 
            return self.response.erroMens(menssage=[Errors.MODELS_ERROR, str(e)], status=500)
        return self.response.sucessMens(mensage=Success.ORDER_RETURNED_SUCEFULD, value=order_model)
    
    def returnOrder(self, time_interval: dict={}, status: str='', code_client: str=''):
        if code_client:
            mens_code = self.validate.validateCode(code_client)
            if mens_code != MENSAGE_SUCESS:
                return self.response.erroMens(menssage=mens_code, status=400)
            if not self.c_model.clientExists(code_client=code_client):
                return self.response.erroMens(menssage=ERROSCLI.CLIENT_NOT_FOUND, status=400)
        time_interval_clean = {}
        if time_interval:
            mens_date = self.validate.validateDate(time_interval)
            if mens_date != MENSAGE_SUCESS:
                return self.response.erroMens(menssage=mens_date, status=400)
            time_interval_clean['start'] = self.clean_date.date(time_interval['start']) 
            time_interval_clean['end'] = self.clean_date.date(time_interval['end'])  
        if status:
            mens_status = self.validateOrder.status(val=status)
            if mens_status != MENSAGE_SUCESS:
                return self.response.erroMens(menssage=mens_status, status=400)
        try:
            order_model = self.o_model.returnOrder(time_interval=time_interval_clean, status=status, code_client=code_client)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.MODELS_ERROR, str(e)], status=500)
        return self.response.sucessMens(mensage=Success.ORDER_RETURNED_SUCEFULD, value=order_model)
    
    def getOrderByCode(self, code_order: str):
        mens_code = self.validateOrder.code(code_order)
        if mens_code != MENSAGE_SUCESS:
            return self.response.erroMens(menssage=mens_code, status=400)
        if not self.o_model.orderExists(code_order=code_order):
            return self.response.erroMens(menssage=Errors.ORDER_DONT_EXISTS, status=400) 
        try:
            order_model = self.o_model.getOrderByCode(code_order=code_order)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.MODELS_ERROR, str(e)], status=500)  
        return self.response.sucessMens(mensage=Success.ORDER_RETURNED_SUCEFULD, value=order_model)
    
    def updateOrder(self, code_order: str):
        mens_code = self.validateOrder.code(code_order)
        if mens_code != MENSAGE_SUCESS:
            return self.response.erroMens(menssage=mens_code, status=400) 
        if not self.o_model.orderExists(code_order=code_order):
            return self.response.erroMens(menssage=Errors.ORDER_DONT_EXISTS, status=400)  
        try:
            order_model = self.o_model.updateOrder(code_order=code_order)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.MODELS_ERROR, str(e)], status=500)
        return self.response.sucessMens(mensage=Success.ORDER_MODIFIED_SUCEFULD, value=order_model)
    
    def finalizeOrder(self, code_order: str):
        mens_code = self.validateOrder.code(code_order)
        if mens_code != MENSAGE_SUCESS:
            return self.response.erroMens(menssage=mens_code, status=400) 
        if not self.o_model.orderExists(code_order=code_order):
            return self.response.erroMens(menssage=Errors.ORDER_DONT_EXISTS, status=400)  
        try:
            order_model = self.o_model.finalizeOrder(code_order=code_order)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.MODELS_ERROR, str(e)], status=500)
        return self.response.sucessMens(mensage=Success.ORDER_MODIFIED_SUCEFULD, value=order_model)
    
    def deleteOrder(self, code_order: str):
        mens_code = self.validateOrder.code(code_order)
        if mens_code != MENSAGE_SUCESS:
            return self.response.erroMens(menssage=mens_code, status=400)
        if not self.o_model.orderExists(code_order=code_order):
            return self.response.erroMens(menssage=Errors.ORDER_DONT_EXISTS, status=400)
        try:
            self.o_model.deleteOrder(code_order)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.MODELS_ERROR, str(e)], status=500)
        return self.response.sucessMens(mensage=Success.ORDER_DELETE_SUCEFULD, value=None)