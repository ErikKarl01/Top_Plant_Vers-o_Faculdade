from utils.validate import Validate, MENSAGE_SUCESS
from Order.models import Snapshot
from Product.models import Product
from constants.responseClass import Response
from constants.orderConstantes import Errors, Success

class SnapshotService:
    s_model = Snapshot()
    p_model = Product()
    validate = Validate()
    validate_order = Validate().Oder()
    response = Response()
    
    def saveSnapshot(self, code_product: str, price: float):
        mens_code = self.validate.validateCode(code_product)
        mens_price = self.validate_order.validatePrice(price) 
        mensages_erro = []
        
        if mens_code != MENSAGE_SUCESS: mensages_erro.append(mens_code)
        if mens_price != MENSAGE_SUCESS: mensages_erro.append(mens_price)
        if mensages_erro: return self.response.erroMens(menssage=mensages_erro, status=400)
            
        if not self.p_model.productExists(code_product=code_product):
            return self.response.erroMens(menssage="Produto não encontrado.", status=400)
            
        try:
            snapshot_model = self.s_model.saveSnapshot(code_product=code_product, price=price)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.MODELS_ERROR, str(e)], status=500)
        return self.response.sucessMens(mensage="Snapshot criado com sucesso.", value=snapshot_model)

    def updateSnapshot(self, code_snapshot: str, price: float, discount: float):
        mens_code = self.validate.validateCode(code_snapshot)
        mens_price = self.validate_order.validatePrice(price)
        mens_discount = self.validate_order.validateDiscount(discount)
        
        mensages_erro = []
        if mens_code != MENSAGE_SUCESS: mensages_erro.append(mens_code)
        if mens_price != MENSAGE_SUCESS: mensages_erro.append(mens_price)
        if mens_discount != MENSAGE_SUCESS: mensages_erro.append(mens_discount)
        if mensages_erro: return self.response.erroMens(menssage=mensages_erro, status=400)
        
        try:
            snapshot_model = self.s_model.returnSnapshot(code_snapshot=code_snapshot)
            if not snapshot_model:
                return self.response.erroMens(menssage="Snapshot não encontrado.", status=400)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.MODELS_ERROR, str(e)], status=500)
        
        if price == -1:
            price = self.p_model.productReturn(code_product=snapshot_model.product.code).price
         
        if price <= discount and (price != 0 and discount !=0):
            return self.response.erroMens(menssage=Errors.DICOUNT_BIGGER_PRICE, status=400)
        
        try:
            snapshot_model = self.s_model.updateSnapshot(code_snapshot=code_snapshot, price=price, discount=discount)
            if not snapshot_model:
                return self.response.erroMens(menssage="Snapshot não encontrado.", status=400)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.MODELS_ERROR, str(e)], status=500)
        try:
            self.p_model.productUpdatePrice(code_product=snapshot_model.product.code, price=snapshot_model.price)
        except Exception as e: 
            return self.response.erroMens(menssage=["Erro na modificação de proço do produto", str(e)], status=500)   
        return self.response.sucessMens(mensage="Snapshot atualizado com sucesso.", value=snapshot_model)
    
    def updateSnapshotPrice(self, code_product: str, price_product: float):
        mens_code = self.validate.validateCode(code_product)
        mens_price = self.validate_order.validatePrice(price_product)
        mens_erro = []
        if mens_code != MENSAGE_SUCESS: mens_erro.append(mens_code)
        if mens_price != MENSAGE_SUCESS: mens_erro.append(mens_price)
        if mens_erro: return self.response.erroMens(menssage=mens_erro, status=400)
        
        try:
            snapshot_model = self.s_model.updatePrice(code_product=code_product, price=float(price_product))
            if not snapshot_model:
                return self.response.erroMens(menssage="Snapshot não encontrado.", status=400)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.MODELS_ERROR, str(e)], status=500)
        return self.response.sucessMens(mensage="Snapshot atualizado com sucesso.", value=None)
    
    def listSnapshots(self):
        return self.s_model.listSnapshots()