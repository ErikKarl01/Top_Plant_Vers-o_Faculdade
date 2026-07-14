from utils.converet.convertStock import ConvertStock, ConvertOperations, ConvertStockItem
from constants.responseClass import Response
from constants.stockConstants import Errors, Success
from Stock.models import Stock, StockItem, Operations
from utils.validate import Validate, MENSAGE_SUCESS
from Product.models import Product
from constants.productConstants import PRODUCT_TYPE_CHOICES
from utils.toClean import ToClean
import re

def categoryProductValidate(category: str):
    print(f"Validating category: {category}", f"Valid categories: {[choice[1] for choice in PRODUCT_TYPE_CHOICES]}")
    if category not in [choice[1] for choice in PRODUCT_TYPE_CHOICES]:
        return False
    return True

def productsLicensedValidate(products_licensed: bool):
    if not isinstance(products_licensed, bool):
        return False
    return True

def validateCodeStock(code_stock: str):
    if not isinstance(code_stock, str) or len(code_stock) < 4:
        return False
    if not re.match(r'^[A-Z0-9]+$', code_stock):
        return False
    return True

class Service:
    stock_model = Stock()
    item_model = StockItem()
    validate = Validate()
    operation_model = Operations()
    convert_stock = ConvertStock()
    convert_items = ConvertStockItem()
    convert_operations = ConvertOperations()
    product_model = Product()
    response = Response()
    errors = Errors()
    sucess = Success()
    clean = ToClean()

    def stockCreate(self, category: str, products_licensed: bool, code_product: str=None):
        if not self.stock_model.stockExists(category=category, products_licensed=products_licensed):
            try:
                stock_model = self.stock_model.stockCreate(category=category, products_licensed=products_licensed)
            except Exception as e:
                return self.response.erroMens(menssage=[self.errors.MODELS_OPERATION, str(e)], status=500)
        else:
            stock_model = self.stock_model.stockReturnForCategory(stock_category=category, products_licensed=products_licensed)
        try:
            item_model = self.item_model.stockItemCreate(code_product=code_product, code_stock=stock_model.code)
        except Exception as e:
            return self.response.erroMens(menssage=[self.errors.MODELS_OPERATION, str(e)], status=500)
        try:
            self.operation_model.operationCreate(code_product=code_product, operation_type='CRIACAO')
        except Exception as e:
            return self.response.erroMens(menssage=[self.errors.MODELS_OPERATION, str(e)], status=500)
        return self.response.sucessMens(mensage=self.sucess.STOCK_ITEM_CREATED, value=item_model)
    
    def retusrItemAmount(self, code_product: str):
        return self.item_model.returItemAmount(code_product=code_product)

    def addAmount(self, code_product: str, amount: int) -> Response:
        mens_validate = self.validate.validateCode(val=code_product)
        mens_validate_amount = self.validate.validateInt(val=amount)
        erro_mensages = []
        if not mens_validate == MENSAGE_SUCESS:
            erro_mensages.append(mens_validate)
        if not mens_validate_amount:
            erro_mensages.append(Errors.INVALID_AMOUNT)
        if erro_mensages:
            return self.response.erroMens(menssage=erro_mensages, status=400)
        amount = int(amount)
        if not self.product_model.productExists(code_product=code_product):
            return self.response.erroMens(menssage=[self.errors.STOCK_ITEM_NOT_FOUND], status=400)
        item = self.item_model.stockItemReturn(code_product=code_product)
        if not item:
            return self.response.erroMens(menssage=[self.errors.STOCK_ITEM_NOT_FOUND], status=400)
        if item.amount + amount > 1000000:
            return self.response.erroMens(menssage=[self.errors.LIMIT_EXCEEDED], status=400)
        try:
            self.item_model.addAmount(product_code=code_product, amount=amount)
        except Exception as e:
            return self.response.erroMens(menssage=[self.errors.MODELS_OPERATION, str(e)], status=500)
        try:
            self.operation_model.operationCreate(code_product=code_product, operation_type='ADICAO', value_after=item.amount+amount, value_before=item.amount)
        except Exception as e:
            return self.response.erroMens(menssage=[self.errors.MODELS_OPERATION, str(e)], status=500)
        return self.response.sucessMens(mensage=self.sucess.STOCK_ITEM_UPDATED, value=None)

    def removeAmount(self, code_product: str, amount: int):
        mens_validate = self.validate.validateCode(val=code_product)
        mens_validate_amount = self.validate.validateInt(val=amount)
        erro_mensages = []
        if not mens_validate == MENSAGE_SUCESS:
            erro_mensages.append(mens_validate)
        if not mens_validate_amount:
            erro_mensages.append(Errors.INVALID_AMOUNT)
        if erro_mensages:
            return self.response.erroMens(menssage=erro_mensages, status=400)
        amount = int(amount)
        if not self.product_model.productExists(code_product=code_product):
            return self.response.erroMens(menssage=[self.errors.STOCK_ITEM_NOT_FOUND], status=400)
        item = self.item_model.stockItemReturn(code_product=code_product)
        if not item:
            return self.response.erroMens(menssage=[self.errors.STOCK_ITEM_NOT_FOUND], status=400)
        if item.amount < amount:
            return self.response.erroMens(menssage=[self.errors.INSUFICIENT_STOCK], status=400)
        try:
            self.item_model.removeAmount(product_code=code_product, amount=amount)
        except Exception as e:
            return self.response.erroMens(menssage=[self.errors.MODELS_OPERATION, str(e)], status=500)
        try:
            self.operation_model.operationCreate(code_product=code_product, operation_type='REMOCAO', value_after=item.amount-amount, value_before=item.amount)
        except Exception as e:
            return self.response.erroMens(menssage=[self.errors.MODELS_OPERATION, str(e)], status=500)
        return self.response.sucessMens(mensage=self.sucess.STOCK_ITEM_UPDATED, value=None)

    def stockReturnForCategory(self, category: str, products_licensed: bool):
        erro_mensages = []
        if not categoryProductValidate(category):
            erro_mensages.append(self.errors.INVALID_CATEGORY)
        if not productsLicensedValidate(products_licensed):
            erro_mensages.append(self.errors.INVALID_PRODUCTS_LICENSED)
        if erro_mensages:
            return self.response.erroMens(menssage=erro_mensages, status=400)
        if category in PRODUCT_TYPE_CHOICES[0]:
            category = PRODUCT_TYPE_CHOICES[0][0]
        elif category in PRODUCT_TYPE_CHOICES[1]:
            category = PRODUCT_TYPE_CHOICES[1][0]
        stock = self.stock_model.stockReturnForCategory(stock_category=category, products_licensed=products_licensed)
        if not stock:
            return self.response.erroMens(menssage=[self.errors.STOCK_NOT_FOUND], status=400)
        items = self.item_model.stockItemsList(stock_code=stock.code)
        dict_items = []
        for item in items:
            try:
                dict_item = self.convert_items.toDict(stock_item=item)
                dict_items.append(dict_item)
            except Exception as e:
                return self.response.erroMens(menssage=[self.errors.CONVERSION_ERROR, str(e)], status=500)
        try:
            dict_stock = self.convert_stock.toDict(stock=stock)
        except Exception as e:
            return self.response.erroMens(menssage=[self.errors.CONVERSION_ERROR, str(e)], status=500)
        dict_return = {}
        dict_return['stock'] = dict_stock
        dict_return['items'] = dict_items
        return self.response.sucessMens(mensage=self.sucess.STOCK_UPDATED, value=dict_return)
    
    def operationsReturn(self, stock_code: str='', code_product: str='', time_interval: dict={}):
        stock_code = self.clean.alphaNumeric(stock_code)
        code_product = self.clean.alphaNumeric(code_product)
        mens_code_stock = validateCodeStock(code_stock=stock_code)
        mens_code_product = self.validate.validateCode(val=code_product)
        mens_time_interval = self.validate.validateDate(time_interval=time_interval)
        erro_mensages = []
        time_interval_clean = {}
        if stock_code and not mens_code_stock:
            erro_mensages.append(self.errors.INVALID_STOCK_CODE)
        if code_product and mens_code_product != MENSAGE_SUCESS:
            erro_mensages.append(mens_code_product)
        if time_interval and mens_time_interval != MENSAGE_SUCESS:
            erro_mensages.append(mens_time_interval)    
        if erro_mensages:
            return self.response.erroMens(menssage=erro_mensages, status=400)
        if time_interval:
            time_interval_clean['start'] = self.clean.date(val=time_interval.get('start', ''))
            time_interval_clean['end'] = self.clean.date(val=time_interval.get('end', ''))
        try:
            operations = self.operation_model.operationsReturn(stock_code=stock_code,
                                                               code_product=code_product,
                                                               time_interval=time_interval_clean)
        except Exception as e:
            return self.response.erroMens(menssage=[self.errors.MODELS_OPERATION, str(e)], status=500)
        try:
            dict_operations = [self.convert_operations.toDict(operations=operation) for operation in operations]
        except Exception as e:
            return self.response.erroMens(menssage=[self.errors.CONVERSION_ERROR, str(e)], status=500)
        return self.response.sucessMens(mensage=self.sucess.STOCK_UPDATED, value=dict_operations)
    
    def itemAmountReturn(self, code_product: str):
        mens_code = self.validate.validateCode(code_product)
        if mens_code != MENSAGE_SUCESS:
            return self.response.erroMens(menssage=mens_code, status=400)
        if not self.product_model.productExists(code_product):
            return self.response.erroMens(menssage='Produto não encontrado', status=404)
        
        try:
            item = self.item_model.stockItemReturn(code_product=code_product)
            if not item: 
                return self.response.erroMens(menssage='Item não encontrado no estoque', status=404)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.MODELS_OPERATION, str(e)], status=500)
        
        return self.response.sucessMens(mensage='', value=item.amount)
        