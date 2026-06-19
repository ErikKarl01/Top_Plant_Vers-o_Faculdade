from sistem.TPV2.constants.clientConstants import TYPE_PEOPLEPLACE_CHOICES

PEOPLE_PLACE_LIST = [t[1] for t in TYPE_PEOPLEPLACE_CHOICES]


class FormatToReturn:
    def cpf(self, val: str):
        val = str(val)
        return f'{val[:3]}.{val[3:6]}.{val[6:9]}-{val[9:11]}'
    
    def cnpj(self, val: str):
        val = str(val)
        return f'{val[:2]}.{val[2:5]}.{val[5:8]}/{val[8:12]}-{val[12:14]}'
    
    def contact(self, val: str):
        val = str(val)
        if len(val) == 11:
            return f'({val[:2]}) {val[2:7]}-{val[7:]}'
        if len(val) == 10:
            return f'({val[:2]}) {val[2:6]}-{val[6:]}'
        return val
    
    def zCode(self, val: str):
        val = str(val)
        return f'{val[:5]}-{val[5:9]}'
    
    def pPlace(self, val: str) -> str:
        val = str(val)
        for p in PEOPLE_PLACE_LIST:
            if p == val:
                p = p 
        return p