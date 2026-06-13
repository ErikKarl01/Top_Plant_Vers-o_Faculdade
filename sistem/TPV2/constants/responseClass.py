from typing import Any


class Response():
    menssage: str
    status: int
    value: Any
    sucess: bool
    
    def __init__(self, status: int=0, menssage: str='', value: Any=None, sucess: bool=False):
        self.status = status
        self.menssage = menssage
        self.value = value
        self.sucess = sucess
       
    def sucessMens(self, mensage, value):
            self.menssage=mensage
            self.status=200
            self.sucess=True
            self.value=value
            return self
     
    def erroMens(self, menssage, status):
            self.menssage=menssage
            self.status=status
            self.sucess=False
            self.value=None
            return self
    
    def toDict(self):
        return {
            'status': self.status,
            'mensage': self.menssage,
            'sucess': self.sucess,
            'value': self.value
        }
    