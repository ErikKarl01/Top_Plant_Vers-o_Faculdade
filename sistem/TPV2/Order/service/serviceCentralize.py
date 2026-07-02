from utils.toClean import ToClean
from constants.responseClass import Response
from utils.converet.convertOrder import ConvertOrderItem, ConvertOrder, ConvertSnapshot
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
    c_snapshot = ConvertSnapshot()
    
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
        try:
            response_update.value = self.c_snapshot.toDict(response_update.value)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.CONVERSION_ERROR, str(e)], status=500).toDict() 
        if not response_update.sucess:
            return response_update.toDict()
        return response_update.toDict()
    
    def returnSnapshotsTarget(self, price_target: float):
        snaps = self.snap_service.listSnapshots()
        if not snaps:
            return self.response.sucessMens(mensage="Não há snapshots cadastrados", value=None)
        
        dict_snaps_rest = {}
        list_snaps_rest = []
        
        for snap in snaps:
            dict_snaps_rest['snap'] = snap
            dict_snaps_rest['rest'] = price_target%snap.price
            list_snaps_rest.append
        
        list_sort = sorted(dict_snaps_rest, key=dict_snaps_rest['rest'])
        return_snaps = []
        
        for snap in list_sort:
            try:
                return_snaps.append(self.c_snapshot.toDict(snap['snap']))
            except Exception as e:
                return self.response.erroMens(menssage=[Errors.CONVERSION_ERROR, str(e)], status=500)
        return self.response.sucessMens(mensage='', value=return_snaps)
          

    def createOrder(self, code_client: str, items: list):
        code_order_clean = cleanCode(code_client)
        response_save_order = self.o_service.createOrder(code_client=code_order_clean)
        
        if not response_save_order.sucess:
            return self.response.toDict()
        order = response_save_order.value
        list_items_order = []
        
        for item in items:
            code_product_clean = cleanCode(item.get('code_product', ''))
            amount = item.get('amount', 0)
            response_save_item = self.i_service.saveItem(code_order=order.code, code_product=code_product_clean, amount=amount)
            if not response_save_item.sucess:
                return response_save_item.toDict()
            item_model = response_save_item.value
            
            try:
                item_dict = self.c_item.toDict(item=item_model)
                order_dict = self.c_order.toDict(order)
                list_items_order.append(item_dict)
            except Exception as e:
                return self.response.erroMens(menssage=[Errors.CONVERSION_ERROR, str(e)], status=500)
        
        dict_return = {}
        dict_return['order'] = order_dict
        dict_return['items'] = list_items_order
        
        return self.response.sucessMens(mensage=Success.ORDER_CREATED_SUCEFULD, value=dict_return)
    
    def updateOrder(self, code_order: str, items: list):
        code_clean = cleanCode(code=code_order)
        mens_update_order = self.o_service.updateOrder(code_order=code_clean)
        if not mens_update_order.sucess:
            return mens_update_order.toDict()
        order = mens_update_order.value
        list_items_order = []
        
        for item in items:
            code_product_clean = cleanCode(item.get('code_product', ''))
            provided = item.get('provided', 0)
            response_save_item = self.i_service.updateItem(code_order=order.code,
                code_product=code_product_clean, provided=provided)
            
            if not response_save_item.sucess:
                return response_save_item.toDict()
            item_model = response_save_item.value
            
            try:
                item_dict = self.c_item.toDict(item=item_model)
                order_dict = self.c_order.toDict(order)
                list_items_order.append(item_dict)
            except Exception as e:
                return self.response.erroMens(menssage=[Errors.CONVERSION_ERROR, str(e)], status=500)
        
        dict_return = {}
        dict_return['order'] = order_dict or ''
        dict_return['items'] = list_items_order or ''
        
        return self.response.sucessMens(mensage=Success.ORDER_MODIFIED_SUCEFULD, value=dict_return)

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