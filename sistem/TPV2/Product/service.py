from utils.toClean import ToClean
from utils.validate import Validate, MENSAGE_SUCESS
from utils.converet.convertProduct import ConvertProduct
from Product.dto import ProductDTO
from constants.responseClass import Response
from Product.models import Product
from constants.productConstants import Errors, Success, PRODUCT_TYPE_CHOICES
from Order.service.serviceCentralize import ServiceCentralized
from Stock.service import Service as StockService

def cleanProduct(product: ProductDTO) -> ProductDTO:
    toClean = ToClean()
    product.name = toClean.name(product.name)
    product.description = toClean.text(product.description)
    product.code = toClean.alphaNumeric(product.code)
    product.type = toClean.enums(product.type)
    product.measure = toClean.enums(product.measure)
    return product


class Service:
    convert = ConvertProduct()
    validate = Validate()
    validate_product = Validate().Product()
    toClean = ToClean()
    response = Response()
    p_model = Product()
    s_stock = StockService()
    snapshot_create = ServiceCentralized()

    def productSave(self, product: ProductDTO):
        product_clean = cleanProduct(product)
        mensage_validate = self.validate_product.forRegister(product_clean)
        if mensage_validate != MENSAGE_SUCESS:
            return self.response.erroMens(menssage=mensage_validate, status=400)
        if self.p_model.productExists(product_clean.code):
            return self.response.erroMens(menssage=Errors.PRODUCT_ALREADY_EXISTS, status=400)
        if self.p_model.nametAlreadyRegistered(product_clean.name):
            return self.response.erroMens(menssage=Errors.NAME_ALREADY_EXISTS, status=400)
        try:
            product_model = self.convert.toModel(product_clean)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.CONVERSION_ERROR, str(e)], status=500)
        try:
            product_return = self.p_model.productSave(product_model)
            product_saved = self.p_model.productSave(product_model)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.MODELS_ERROR, str(e)], status=500)
        try:
            product_return = self.convert.toDict(product_return)
            product_return = self.convert.toDict(product_saved)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.CONVERSION_ERROR, str(e)], status=500)
        self.snapshot_create.saveSnapshot(code_product=product_saved.code, price_product=product_saved.price)
        resp = self.s_stock.stockCreate(category=product_saved.type, products_licensed=product_saved.licensed,
                                                                        code_product=product_saved.code)
        if not resp.sucess:
            return resp
        return self.response.sucessMens(mensage=Success.PRODUCT_REGISTERED, value=product_return)


    def productUpdate(self, product: ProductDTO, code_product: str):
        product_clean = cleanProduct(product)
        mensage_validate = self.validate_product.forRegister(product_clean)
        mensage_validate_code = self.validate.validateCode(code_product)
        
        if mensage_validate_code != MENSAGE_SUCESS:
            return self.response.erroMens(menssage=mensage_validate_code, status=400)
            
        old_product = self.p_model.productReturn(code_product=code_product)
        if not old_product:
            return self.response.erroMens(menssage=Errors.PRODUCT_NOT_FOUND, status=404)
            
        if mensage_validate != MENSAGE_SUCESS:
            return self.response.erroMens(menssage=mensage_validate, status=400)
            
        if product_clean.code != old_product.code and self.p_model.productExists(product_clean.code):
            return self.response.erroMens(menssage=Errors.PRODUCT_ALREADY_EXISTS, status=400)
            
        if product_clean.name != old_product.name and self.p_model.nametAlreadyRegistered(product_clean.name):
            return self.response.erroMens(menssage=Errors.NAME_ALREADY_EXISTS, status=400)

        try:
            product_model = self.convert.toModel(product_clean)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.CONVERSION_ERROR, str(e)], status=500)
            
        try:
            product_return = self.p_model.productUpdate(product_model, code_product)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.MODELS_ERROR, str(e)], status=500)
            
        if product_return is None:
            return self.response.erroMens(menssage=Errors.PRODUCT_NOT_FOUND, status=404)
            
        try:
            product_return = self.convert.toDict(product_return)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.CONVERSION_ERROR, str(e)], status=500)
            
        return self.response.sucessMens(mensage=Success.PRODUCT_MODIFIED, value=product_return)


    def productList(self):
        productList = self.p_model.productList()
        if not productList:
            return self.response.erroMens(menssage=Errors.PRODUCT_NOT_FOUND, status=404)
        product_list_dict = []
        try:
            for product in productList:
                product_dict = self.convert.toDict(product)
                product_list_dict.append(product_dict)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.CONVERSION_ERROR, str(e)], status=500)
        return self.response.sucessMens(mensage=Success.RETURN, value=product_list_dict)


    def productDelete(self, code_product: str):
        mensage_validate_code = self.validate.validateCode(code_product)
        if mensage_validate_code != MENSAGE_SUCESS:
            return self.response.erroMens(menssage=mensage_validate_code, status=400)
        if not self.p_model.productExists(code_product):
            return self.response.erroMens(menssage=Errors.PRODUCT_NOT_FOUND, status=404)
        try:
            self.p_model.productDelete(code_product)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.MODELS_ERROR, str(e)], status=500)
        return self.response.sucessMens(mensage=Success.PRODUCT_DELETED, value=None)


    def productReturn(self, name: str='', code_product: str=''):
        if not name and not code_product:
            return self.response.erroMens(menssage=Errors.NULL_FIELDS, status=404)
        erro_mensages = []
        if code_product:
            mensage_validate_code = self.validate.validateCode(code_product)
            if mensage_validate_code != MENSAGE_SUCESS:
                erro_mensages.append(mensage_validate_code)
        if name:
            mensage_validate_name = self.validate_product.name(name)
            if mensage_validate_name != MENSAGE_SUCESS:
                erro_mensages.append(mensage_validate_name)
        if erro_mensages:
            return self.response.erroMens(menssage=erro_mensages, status=400)
        try:
            product = self.p_model.productReturn(code_product=code_product, name=name)
            if not product:
                return self.response.erroMens(menssage=Errors.PRODUCT_NOT_FOUND, status=404)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.MODELS_ERROR, str(e)], status=500)
        try:
            product = self.convert.toDict(product)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.CONVERSION_ERROR, str(e)], status=500)
        if not product:
            return self.response.erroMens(menssage=Errors.PRODUCT_NOT_FOUND, status=404)
        return self.response.sucessMens(mensage=Success.RETURN, value=product)


    def productUpdatePrice(self, code_product: str='', name: str='', price: float=0.0):
        mensage_validate_price = self.validate_product.price(price)
        mensage_validate_code = self.validate.validateCode(code_product)
        mensage_validate_name = self.validate_product.name(name)
        erro_mens = []
        if mensage_validate_price != MENSAGE_SUCESS:
            erro_mens.append(mensage_validate_price)
        if code_product and mensage_validate_code != MENSAGE_SUCESS:
            erro_mens.append(mensage_validate_code)
        if name and mensage_validate_name != MENSAGE_SUCESS:
            erro_mens.append(mensage_validate_name)
        if erro_mens:
            return self.response.erroMens(menssage=erro_mens, status=400)
        if not code_product and not name:
            return self.response.erroMens(menssage=Errors.PRODUCT_NOT_FOUND, status=404)
        try:
            product = self.p_model.productUpdatePrice(code_product=code_product, name=name, price=price)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.MODELS_ERROR, str(e)], status=500)
        if not product:
            return self.response.erroMens(menssage=Errors.PRODUCT_NOT_FOUND, status=404)
        resp = self.snapshot_create.updateSnapshotPrice(code_product=product.code, price_product=product.price)
        if not resp.sucess:
            return resp.toDict()
        try:
            product = self.convert.toDict(product)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.CONVERSION_ERROR, str(e)], status=500)
        return self.response.sucessMens(mensage=Success.PRODUCT_MODIFIED_PRICE, value=product)