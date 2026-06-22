from utils.toClean import ToClean
from constants.responseClass import Response
from utils.converet.convertOrder import ConvertOrderItem, ConvertOrder
from Order.service.orderItemService import OrderItemService
from Order.service.orderService import OrderService
from utils.converet.convertOrder import ConvertOrder, ConvertOrderItem
from Product.service import Service
from constants.orderConstantes import Errors

def cleanCode(code: str):
    code_str = str(code)
    cleanner = ToClean.alphaNumeric()
    return cleanner(code_str)


class ServiceCentralized:
    response = Response()
    o_service = OrderService()
    i_service = OrderItemService()
    c_item = ConvertOrderItem()
    c_order = ConvertOrder()
    p_service = Service()
    
    def saveItem(self, code_product: str, price_product: float):
        code_prod_clean = cleanCode(code=code_product)
        response_save = self.i_service.saveItem(code_product=code_prod_clean, price_product=price_product)
        
        if not response_save.sucess:
            return response_save.toDict()
        return True
    
    
    def createOrder(self, code_client: str, codes_product_diacounts: list):
        for value in codes_product_diacounts:
            value['product_code'] = cleanCode(value['product_code'])
        code_client_clean = cleanCode(code=code_client)
        
        response_create_order = self.o_service.createOrder(code_client=code_client_clean)
        
        if not response_create_order.sucess:
            return response_create_order.toDict()
        
        code_order = self.response.value.code
        
        for value in codes_product_diacounts:
            response_create_item = self.i_service.updateForOrderItem(code_product=value['product_code'], code_order=code_order)
            product = self.p_service.productReturn(code_product=value['product_code']).value
            response_utdate_item = self.i_service.updateItem(code_product=value['product_code'],
            discount=value['discount'], price_product=product.price)
            if not response_create_item.sucess:
                return response_create_item.toDict()
            if not response_utdate_item.sucess:
                return response_utdate_item.toDict()
        
        
        pass
        