class ClientDTO:
    def __init__(self, code: str='', name: str='', doc_type: str='',
        doc: str='', contact: str='', email: str='', state_register: str=''):
        self.code = code
        self.name = name
        self.doc = doc
        self.doc_type = doc_type
        self.contact = contact
        self.email = email 
        self.state_register = state_register
        
class AdressDTO:
    def __init__(self, code_zone: str='', city: str='', people_place: str='',
        neig_b: str='', number: str='', type: str=''):
        self.code_zone = code_zone
        self.city = city
        self.people_place = people_place
        self.neig_b = neig_b
        self.number = number
        self.type = type