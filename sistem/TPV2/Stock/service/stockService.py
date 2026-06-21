from utils.validate import Validate, MENSAGE_SUCESS
from Stock.models import Stock
from constants.stockConstants import Errors, Success
from constants.responseClass import Response

class StockService:
    validate = Validate()
    s_model = Stock()

    def stockCreate(self, category: str) -> Response:
        mens_category = self.validate.Stock.stock_type(val=category)
        if mens_category != MENSAGE_SUCESS:
            return Response().erroMens(menssage=mens_category, status=400)
            
        if self.s_model.stockExists(category=category):
            return Response().erroMens(menssage=Errors.STOCK_ALREADY_EXISTS, status=409)
            
        try:
            stock_model = self.s_model.stockCreate(category=category)
        except Exception:
            return Response().erroMens(menssage=Errors.MODELS_OPERATION, status=500)
            
        return Response().sucessMens(mensage=Success.STOCK_CREATED, value=stock_model)


    def stockModify(self, stove_name: str, stock_code: str) -> Response:
        mens_name = self.validate.Stock.stoveName(val=stove_name)
        mens_code = self.validate.Stock.code(val=stock_code)
        mensages_erro = []
        
        if mens_name != MENSAGE_SUCESS:
            mensages_erro.append(mens_name)
        if mens_code != MENSAGE_SUCESS:
            mensages_erro.append(mens_code)
        if mensages_erro:
            return Response().erroMens(menssage=mensages_erro, status=400)
            
        if not self.s_model.stockExists(code_stock=stock_code):
            return Response().erroMens(menssage=Errors.STOCK_NOT_FOUND, status=404)
            
        try:
            stock_model = self.s_model.stockUpdate(stove_name=stove_name, stock_code=stock_code)
        except Exception:
            return Response().erroMens(menssage=Errors.MODELS_OPERATION, status=500)
            
        return Response().sucessMens(mensage=Success.STOCK_UPDATED, value=stock_model)


    def stockDelete(self, stock_code: str) -> Response:
        mens_code = self.validate.Stock.code(val=stock_code)
        if mens_code != MENSAGE_SUCESS:
            return Response().erroMens(menssage=mens_code, status=400)
            
        if not self.s_model.stockExists(code_stock=stock_code):
            return Response().erroMens(menssage=Errors.STOCK_NOT_FOUND, status=404)
            
        try:
            self.s_model.stockDelete(stock_code=stock_code)
        except Exception:
            return Response().erroMens(menssage=Errors.MODELS_OPERATION, status=500)
            
        return Response().sucessMens(mensage=Success.STOCK_DELETED, value=None)


    def stockReturnByCode(self, stock_code: str) -> Response:
        mens_code = self.validate.Stock.code(val=stock_code)
        if mens_code != MENSAGE_SUCESS:
            return Response().erroMens(menssage=mens_code, status=400)
            
        stock_model = self.s_model.stockReturnFromCode(stock_code=stock_code)
        if not stock_model:
            return Response().erroMens(menssage=Errors.STOCK_NOT_FOUND, status=404)
            
        return Response().sucessMens(mensage=Success.STOCK_RETURNED, value=stock_model)


    def stockReturnByCategory(self, category: str) -> Response:
        mens_category = self.validate.Stock.stock_type(val=category)
        if mens_category != MENSAGE_SUCESS:
            return Response().erroMens(menssage=mens_category, status=400)
            
        stock_model = self.s_model.stockReturnForCategory(stock_category=category)
        if not stock_model:
            return Response().erroMens(menssage=Errors.STOCK_NOT_FOUND, status=404)
            
        return Response().sucessMens(mensage=Success.STOCK_RETURNED, value=stock_model)