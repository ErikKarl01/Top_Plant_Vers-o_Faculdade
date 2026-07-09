from utils.toClean import ToClean
from constants.responseClass import Response
from Stock.service import Service as StockService
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
    stock_service = StockService()
    
    def listSnapshots(self):
        snapshots_list = self.snap_service.listSnapshots()
        list_dicts = []
        for snap in snapshots_list:
            try:
                list_dicts.append(self.c_snapshot.toDict(snap))
            except Exception as e:
                return self.response.erroMens(menssage=Errors.CONVERSION_ERROR, status=500)
        return self.response.sucessMens(value=list_dicts, mensage=Success.ITEM_ORDER_RETURNED_SUCEFULD)
    
    def saveSnapshot(self, code_product: str, price_product: float):
        code_prod_clean = cleanCode(code=code_product)
        response_save = self.snap_service.saveSnapshot(code_product=code_prod_clean, price=price_product)
        if not response_save.sucess:
            return response_save
        return response_save
        
    def updateSnapshot(self, code_snapshot: str, price_product: float, discount: float):
        code_snap_clean = cleanCode(code=code_snapshot)
        response_update = self.snap_service.updateSnapshot(code_snapshot=code_snap_clean, price=price_product, discount=discount)
        if not response_update.sucess:
            return response_update
        try:
            response_update.value = self.c_snapshot.toDict(response_update.value)
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.CONVERSION_ERROR, str(e)], status=500) 
        if not response_update.sucess:
            return response_update
        return response_update
    
    def updateSnapshotPrice(self, code_product: str, price_product: float):
        code_clean = cleanCode(code=code_product)
        response_update = self.snap_service.updateSnapshotPrice(code_product=code_clean, price_product=price_product)
        if not response_update.sucess:
            return response_update
        return self.response.sucessMens(mensage=Success.ITEM_ORDER_MODIFIED_SUCEFULD, value=response_update.value)
    
    def returnSnapshotsTarget(self, price_target: float):
        if not price_target:
            return self.response.sucessMens(mensage="Não foi escolhido uma meta de preço", value=None)
        snaps = self.snap_service.listSnapshots()
        if not snaps:
            return self.response.sucessMens(mensage="Não há snapshots cadastrados", value=None)
        
        list_snaps_rest = []
        
        for snap in snaps:
            if snap.price == 0:
                continue
            touple_ = (snap, round(price_target%snap.price, 2), price_target//snap.price)
            list_snaps_rest.append(touple_)
        
        list_sort = sorted(list_snaps_rest, key=lambda x: x[1], reverse=False)
        return_snaps = []
        
        for snap in list_sort:
            try:
                dict_rreturn = {}
                dict_rreturn['snap'] = self.c_snapshot.toDict(snap[0])
            except Exception as e:
                return self.response.erroMens(menssage=[Errors.CONVERSION_ERROR, str(e)], status=500)
            dict_rreturn['total_value'] = snap[2]*snap[0].price
            dict_rreturn['quantidade'] = int(snap[2])
            return_snaps.append(dict_rreturn)
        return self.response.sucessMens(mensage='', value=return_snaps)
          

    def createOrder(self, code_client: str, items: list):
        code_order_clean = cleanCode(code_client)
        response_save_order = self.o_service.createOrder(code_client=code_order_clean)
        
        if not response_save_order.sucess:
            return response_save_order
        order = response_save_order.value
        list_items_order = []
        
        for item in items:
            code_product_clean = cleanCode(item.get('code_product', ''))
            amount = item.get('amount', 0)
            if self.stock_service.retusrItemAmount(code_product_clean) < amount:
                return self.response.erroMens(menssage=Errors.INSULFFICIENT_STOCK, status=400)
            response_save_item = self.i_service.saveItem(code_order=order.code, code_product=code_product_clean, amount=amount)
            if not response_save_item.sucess:
                return response_save_item
            item_model = response_save_item.value
            print(response_save_item.status)
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
            return mens_update_order
        order = mens_update_order.value
        list_items_order = []
        
        for item in items:
            code_product_clean = cleanCode(item.get('code_product', ''))
            provided = item.get('provided', 0)
            response_save_item = self.i_service.updateItem(code_order=order.code,
                code_product=code_product_clean, provided=provided)
            
            if not response_save_item.sucess:
                return response_save_item
            item_model = response_save_item.value
            
            try:
                item_dict = self.c_item.toDict(item=item_model)
                order_dict = self.c_order.toDict(order)
                list_items_order.append(item_dict)
            except Exception as e:
                return self.response.erroMens(menssage=[Errors.CONVERSION_ERROR, str(e)], status=500)
        
        mens_order_items = self.i_service.returnItems(order.code)
        
        if not mens_order_items.sucess:
            return mens_order_items
        order_items = mens_order_items.value
        
        count = 0
        for item in order_items:
            if item.amount != 0:
                count += 1
        
        if count == 0:
            self.o_service.finalizeOrder(order.code)
        
        dict_return = {}
        dict_return['order'] = order_dict or ''
        dict_return['items'] = list_items_order or ''
        
        return self.response.sucessMens(mensage=Success.ORDER_MODIFIED_SUCEFULD, value=dict_return)
    
    def totalValueReturn(self, items: list):
        if not items or not all(item.get('code_product') and item.get('amount') for item in items):
            return self.response.erroMens(menssage='Erro na requisição, falta algummítem do pedido', status=400)
        total = 0
        for item in items:
            response_ = self.snap_service.snapshotReturn(item.get('code_product'))
            if not response_.sucess:
                return response_
            price_roduct = response_.value.price
            try:
                total+=float(item.get('amount')*price_roduct)
            except Exception as e:
                return self.response.erroMens(menssage=['Quantidade inválida detectada', str(e)], status=400)
        return self.response.sucessMens(mensage='Total do pedido:', value=total)

    def getOrderByCode(self, code_order: str):
        code_order_clean = cleanCode(code=code_order)
        resp_order = self.o_service.getOrderByCode(code_order=code_order_clean)
        if not resp_order.sucess:
            return resp_order
        resp_items = self.i_service.returnItems(code_order=code_order_clean)
        if not resp_items.sucess:
            return resp_items 
        try:
            order_dict = self.c_order.toDict(resp_order.value)
            items_dict = [self.c_item.toDict(item) for item in resp_items.value]
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.CONVERSION_ERROR, str(e)], status=500) 
        dict_return = {'order': order_dict, 'order_items': items_dict}
        return self.response.sucessMens(mensage=Success.ORDER_RETURNED_SUCEFULD, value=dict_return)

    def returnOrder(self, time_interval: dict={}, status: str='', code_client: str=''):
        code_client_clean = cleanCode(code=code_client) if code_client else ''
        resp_orders = self.o_service.returnOrder(time_interval=time_interval, status=status, code_client=code_client_clean)
        if not resp_orders.sucess:
            return resp_orders
        list_return = []
        try:
            for order in resp_orders.value:
                resp_items = self.i_service.returnItems(code_order=order.code)
                if not resp_items.sucess:
                    return resp_items
                order_dict = self.c_order.toDict(order)
                items_dict = [self.c_item.toDict(item) for item in resp_items.value]
                list_return.append({'order': order_dict, 'order_items': items_dict})
        except Exception as e:
            return self.response.erroMens(menssage=[Errors.CONVERSION_ERROR, str(e)], status=500)
        return self.response.sucessMens(mensage=Success.ORDER_RETURNED_SUCEFULD, value=list_return)

    def deleteOrder(self, code_order: str):
        code_order_clean = cleanCode(code=code_order)
        resp_delete = self.o_service.deleteOrder(code_order=code_order_clean)
        return resp_delete