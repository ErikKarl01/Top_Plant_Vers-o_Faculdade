
class StockDTO:
    def __init__(self, code: str='', stove_name: str='', category: str='', date_criated: str='', activated: bool=False):
        self.code = code
        self.stove_name = stove_name
        self.category = category
        self.date_criated = date_criated
        self.activated = activated
        
class StockItemDTO:
    def __init__(self, ptoduct_name: str='', product_code: str='', amount: int=0):
        self.product_name = ptoduct_name
        self.product_code = product_code
        self.amount = amount
        
class OperationsDTO:
    def __init__(self, date_operation: str='', name_product: str='', code_product: str='', stock_code: str='',
        value_after: int=0, value_before: int=0, type_operation: str=''):
        self.date_operation = date_operation
        self.name_product = name_product
        self.code_product = code_product
        self.stock_code = stock_code
        self.value_after = value_after
        self.value_before = value_before
        self.type_operation = type_operation