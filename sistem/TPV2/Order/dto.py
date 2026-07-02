class OrderItemDTO:
    def __init__(self, amount: float=0.0, code_product: str=''):
        self.amount = amount
        self.code_product =  code_product