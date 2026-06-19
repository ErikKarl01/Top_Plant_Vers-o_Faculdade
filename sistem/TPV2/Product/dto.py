

class ProductDTO:
    def __init__(self, code: str='', name: str='', price: float=0, description: str='',
                 type: str='', measure: str='', licensed: bool=0, discount: float=0.0):
        self.code = code
        self.name = name
        self.price = price
        self.description = description
        self.type = type
        self.measure = measure
        self.licensed = licensed
        self.discount = discount