from utils.toClean import ToClean
from utils.validate import Validate, MENSAGE_SUCESS
from utils.converet.convertProduct import ConvertProduct
from Product.dto import ProductDTO
from constants.responseClass import Response
from Product.models import Product
from constants.productConstants import Errors, Success
from Order.service.serviceCentralize import ServiceCentralized

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
            return self.response.erroMens(menssage=Errors.PRODUCT_NOT_FOUND, status=404)
        if code_product:
            mensage_validate_code = self.validate.validateCode(code_product)
            if mensage_validate_code != MENSAGE_SUCESS:
                return self.response.erroMens(menssage=mensage_validate_code, status=400)
        if name:
            mensage_validate_name = self.validate_product.name(name)
            if mensage_validate_name != MENSAGE_SUCESS:
                return self.response.erroMens(menssage=mensage_validate_name, status=400)
        try:
            product = self.p_model.productReturn(code_product=code_product, name=name)
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
        mensage_validate_price = self.validate_product.priceAndDiscount(price)
        mensage_validate_code = self.validate.validateCode(code_product)
        mensage_validate_name = self.validate_product.name(name)
        if mensage_validate_price != MENSAGE_SUCESS:
            return self.response.erroMens(menssage=mensage_validate_price, status=400)
        if code_product and mensage_validate_code != MENSAGE_SUCESS:
            return self.response.erroMens(menssage=mensage_validate_code, status=400)
        if name and mensage_validate_name != MENSAGE_SUCESS:
            return self.response.erroMens(menssage=mensage_validate_name, status=400)
        if not code_product and not name:
            return self.response.erroMens(menssage=Errors.PRODUCT_NOT_FOUND, status=404)
        try:
            product = self.p_model.productUpdatePrice(code_product=code_product, name=name, price=price)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.MODELS_ERROR, str(e)], status=500)
        try:
            product = self.convert.toDict(product)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.CONVERSION_ERROR, str(e)], status=500)
        if not product:
            return self.response.erroMens(menssage=Errors.PRODUCT_NOT_FOUND, status=404)
        return self.response.sucessMens(mensage=Success.PRODUCT_MODIFIED_PRICE, value=product)

    def productUpdateDiscount(self, code_product: str='', name: str='', discount: float=0.0):
        mensage_validate_discount = self.validate_product.priceAndDiscount(discount)
        mensage_validate_code = self.validate.validateCode(code_product)
        mensage_validate_name = self.validate_product.name(name)
        if mensage_validate_discount != MENSAGE_SUCESS:
            return self.response.erroMens(menssage=mensage_validate_discount, status=400)
        if code_product and mensage_validate_code != MENSAGE_SUCESS:
            return self.response.erroMens(menssage=mensage_validate_code, status=400)
        if name and mensage_validate_name != MENSAGE_SUCESS:
            return self.response.erroMens(menssage=mensage_validate_name, status=400)
        if not code_product and not name:
            return self.response.erroMens(menssage=Errors.PRODUCT_NOT_FOUND, status=404)
        try:
            product = self.p_model.productUpdateDiscount(code_product=code_product, name=name, discount=discount)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.MODELS_ERROR, str(e)], status=500)
        try:
            product = self.convert.toDict(product)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.CONVERSION_ERROR, str(e)], status=500)
        if not product:
            return self.response.erroMens(menssage=Errors.PRODUCT_NOT_FOUND, status=404)