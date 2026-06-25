from utils.toClean import ToClean
from constants.responseClass import Response
from utils.converet.convertOrder import ConvertOrderItem, ConvertOrder
from Order.service.orderItemService import OrderItemService
from Order.service.orderService import OrderService
from Order.service.snapshotService import SnapshotService
from constants.orderConstantes import Errors, Success

def cleanCode(code: str):
    code_str = str(code)
    cleaner = ToClean()
    return cleaner.alphaNumeric(code_str)

class ServiceCentralized:
    response = Response()
    o_service = OrderService()
    i_service = OrderItemService()
    snap_service = SnapshotService()
    c_item = ConvertOrderItem()
    c_order = ConvertOrder()
    
    def saveSnapshot(self, code_product: str, price_product: float):
        code_prod_clean = cleanCode(code=code_product)
        response_save = self.snap_service.saveSnapshot(code_product=code_prod_clean, price=price_product)
        if not response_save.sucess:
            return response_save.toDict()
        return response_save.toDict()
        
    def updateSnapshot(self, code_snapshot: str, price_product: float, discount: float):
        code_snap_clean = cleanCode(code=code_snapshot)
        response_update = self.snap_service.updateSnapshot(code_snapshot=code_snap_clean, price=price_product, discount=discount)
        if not response_update.sucess:
            return response_update.toDict()
        return response_update.toDict()

    def createOrder(self, code_client: str, items: list | None = None, codes_product: list | None = None):
        code_client_clean = cleanCode(code=code_client)
        normalized_items = []

        if items:
            for item in items:
                if not isinstance(item, dict):
                    continue
                code_product = cleanCode(code=item.get('code_product') or item.get('product_code') or item.get('code') or '')
                amount = item.get('amount', 1)
                try:
                    amount = int(amount)
                except (TypeError, ValueError):
                    amount = 1
                if code_product:
                    normalized_items.append({'code_product': code_product, 'amount': max(1, amount)})

        if not normalized_items and codes_product:
            normalized_items = [{'code_product': cleanCode(code=code_product), 'amount': 1} for code_product in codes_product if cleanCode(code=code_product)]

        response_create_order = self.o_service.createOrder(code_client=code_client_clean)
        if not response_create_order.sucess:
            return response_create_order.toDict()
        code_order = response_create_order.value.code
        items_dict = []
        for item in normalized_items:
            response_create_item = self.i_service.saveItem(code_order=code_order, code_product=item['code_product'], amount=item['amount'])
            if not response_create_item.sucess:
                return response_create_item.toDict()
            try:
                i_dict = self.c_item.toDict(response_create_item.value)
            except Exception as e:
                return self.response.erroMens(menssage=[Errors.CONVERSION_ERROR, str(e)], status=500).toDict() 
            items_dict.append(i_dict)
        try:
            order_dict = self.c_order.toDict(response_create_order.value)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.CONVERSION_ERROR, str(e)], status=500).toDict() 
        dict_return = {
            'order': order_dict,
            'order_items': items_dict
        }
        return self.response.sucessMens(mensage=Success.ORDER_CREATED_SUCEFULD, value=dict_return).toDict() 

    def _handleItemsUpdate(self, code_order_clean: str, items_to_discount: list):
        response_items = self.i_service.returnItem(code_order=code_order_clean)
        if not response_items.sucess:
            return response_items
        current_items = response_items.value
        all_zero = True
        updated_items_dict = []
        for item in current_items:
            prod_code = item.product.code
            current_amount = item.amount
            discount_amount = 0
            for supplied in items_to_discount:
                if cleanCode(supplied.get('code')) == prod_code:
                    discount_amount = supplied.get('amount', 0)
                    break
            new_amount = max(0, current_amount - discount_amount)
            if discount_amount > 0:
                resp_update_item = self.i_service.updateItem(code_order=code_order_clean, code_product=prod_code, amount=new_amount)
                if not resp_update_item.sucess:
                    return resp_update_item
                item_to_convert = resp_update_item.value
            else:
                item_to_convert = item   
            if new_amount > 0:
                all_zero = False   
            try:
                updated_items_dict.append(self.c_item.toDict(item_to_convert))
            except Exception as e:
                return self.response.erroMens(menssage=[Errors.CONVERSION_ERROR, str(e)], status=500)
        return self.response.sucessMens(mensage=Success.ORDER_MODIFIED_SUCEFULD, value={'items': updated_items_dict, 'all_zero': all_zero})

    def _handleOrderUpdate(self, code_order_clean: str, all_zero: bool):
        response_update_order = self.o_service.updateOrder(code_order=code_order_clean)
        if not response_update_order.sucess:
            return response_update_order 
        order_model = response_update_order.value
        if all_zero:
            order_model.status = 'FINALIZADO'
            order_model.save() 
        try:
            order_dict = self.c_order.toDict(order_model)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.CONVERSION_ERROR, str(e)], status=500)  
        return self.response.sucessMens(mensage=Success.ORDER_MODIFIED_SUCEFULD, value=order_dict)

    def updateOrder(self, code_order: str, items_to_discount: list):
        code_order_clean = cleanCode(code=code_order)
        items_response = self._handleItemsUpdate(code_order_clean, items_to_discount)
        if not items_response.sucess:
            return items_response.toDict()  
        all_zero = items_response.value['all_zero']
        items_result = items_response.value['items']
        order_response = self._handleOrderUpdate(code_order_clean, all_zero)
        if not order_response.sucess:
            return order_response.toDict()  
        dict_return = {
            'order': order_response.value,
            'order_items': items_result
        }
        return self.response.sucessMens(mensage=Success.ORDER_MODIFIED_SUCEFULD, value=dict_return).toDict()

    def getOrderByCode(self, code_order: str):
        code_order_clean = cleanCode(code=code_order)
        resp_order = self.o_service.getOrderByCode(code_order=code_order_clean)
        if not resp_order.sucess:
            return resp_order.toDict()
        resp_items = self.i_service.returnItem(code_order=code_order_clean)
        if not resp_items.sucess:
            return resp_items.toDict()  
        try:
            order_dict = self.c_order.toDict(resp_order.value)
            items_dict = [self.c_item.toDict(item) for item in resp_items.value]
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.CONVERSION_ERROR, str(e)], status=500).toDict()  
        dict_return = {'order': order_dict, 'order_items': items_dict}
        return self.response.sucessMens(mensage=Success.ORDER_RETURNED_SUCEFULD, value=dict_return).toDict()

    def returnOrder(self, time_interval: dict={}, status: str='', code_client: str=''):
        code_client_clean = cleanCode(code=code_client) if code_client else ''
        resp_orders = self.o_service.returnOrder(time_interval=time_interval, status=status, code_client=code_client_clean)
        if not resp_orders.sucess:
            return resp_orders.toDict()  
        list_return = []
        try:
            for order in resp_orders.value:
                resp_items = self.i_service.returnItem(code_order=order.code)
                if not resp_items.sucess:
                    return resp_items.toDict()
                order_dict = self.c_order.toDict(order)
                items_dict = [self.c_item.toDict(item) for item in resp_items.value]
                list_return.append({'order': order_dict, 'order_items': items_dict})
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.CONVERSION_ERROR, str(e)], status=500).toDict() 
        return self.response.sucessMens(mensage=Success.ORDER_RETURNED_SUCEFULD, value=list_return).toDict()

    def deleteOrder(self, code_order: str):
        code_order_clean = cleanCode(code=code_order)
        resp_delete = self.o_service.deleteOrder(code_order=code_order_clean)
        return resp_delete.toDict()