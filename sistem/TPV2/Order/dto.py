class OrderItemDTO:
    def __init__(self, amount: int=0, code_product: str=''):
        self.amount = amount
        self.code_product =  code_product