from constants.client import DOCUMENT_TYPE, ADRESS_TYPE, TYPE_PEOPLEPLACE_CHOICES
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from validate_docbr import CNPJ, CPF
from typing import Any
import phonenumbers
import re

'''
| Símbolo | Significado                                 |
| ------- | ------------------------------------------- |
| `^`     | Início da string                            |
| `$`     | Fim da string                               |
| `.`     | Qualquer caractere (exceto quebra de linha) |
| `*`     | Zero ou mais ocorrências                    |
| `+`     | Uma ou mais ocorrências                     |
| `?`     | Zero ou uma ocorrência                      |
| `{n}`   | Exatamente n ocorrências                    |
| `{n,m}` | Entre n e m ocorrências                     |
| `[]`    | Conjunto de caracteres permitidos           |
| `[^]`   | Conjunto de caracteres proibidos            |
| `()`    | Grupo                                       |
| `\|`    | Operador OU                                 |
| `\`     | Escape ou sequência especial                |

'''

PEOPLE_PLACE_LIST = [t[0] for t in TYPE_PEOPLEPLACE_CHOICES]
ADRESS_TYPE_LIST = [t[0] for t in ADRESS_TYPE]
DOCUMENT_TYPE_LIST = [t[0] for t in DOCUMENT_TYPE]
    

MENSAGE_ERRO = {
'nome': 'Campo nome inválido',
'codigo': 'Campo código deve conter apenas letras e números',
'cpf': 'CPF inválido', 
'cnpj': 'CNPJ inválido', 
'email': 'Email inválido', 
'número': 'Número de telefone inválido', 'nscr': 'Inscrição estadual inválida', 
'tipo': 'Tipo de documento inválido, permitido apenas CPF e CNPJ',
'logradouro': 'Campo logradouro inválido', 
'cep': 'Cep inválido, somente números permitidos', 
'num_estabelecimento': 'Campo número inválido, somente valores numéricos permitidos', 
'cidade': 'Campo cidade inválido, somente caracteres e números permitidos', 
'bairro': 'Campo bairro inválido',
'tipo endereço': 'Tipo de endereço inválido',
'doc_type_nao_informado': 'Tipo de documento não informado ou registro estadual inconsistente'
}

MENSAGE_SUCESS = 'SUCESS'



def validateIE(val: str):
    val_str = str(val) or ""
    if val_str and (7 <= len(val_str) <= 14 and val_str.isdigit()):
        return True
    return False

def tamanhoExobitante(val: Any) -> bool:
    val_str = str(val) or ""
    if len(val_str) > 255:
        return True
    return False


class Validate:
    def validateCode(self, val: str) -> str:
        val_str = str(val) or ""
        if tamanhoExobitante(val_str) or len(val_str) > 10 or len(val_str) < 4 or not val_str:
            return MENSAGE_ERRO['codigo']
        if not re.match(r"^[A-Z0-9]+$", val_str.upper()):
            return MENSAGE_ERRO['codigo']
        return MENSAGE_SUCESS
    
    class Client:
        def forRegister(self, client: Any):
            mensages_erro = {}
            validate = Validate()
            mens_code = validate.validateCode(client.code)
            mens_name = self.validateName(client.name)
            mens_doc_type = self.documentType(client.doc_type)
            mens_email = self.email(client.email)
            mens_contact = self.contact(client.contact)
            if mens_doc_type == MENSAGE_SUCESS:
                if client.doc_type == 'CNPJ' and client.state_register:
                    mens_doc = self.cnpj(client.doc)
                    mens_state_register = self.stateRegister(client.state_register)
                elif client.doc_type == 'CPF' and not client.state_register:
                    mens_doc = self.cpf(client.doc)
                    mens_state_register = MENSAGE_SUCESS
                else:
                    mens_doc = MENSAGE_ERRO['doc_type_nao_informado']
            else:
                mens_doc = MENSAGE_ERRO['doc_type_nao_informado']
            mensages = {
                'mens_code': mens_code,
                'mens_name': mens_name,
                'mens_email': mens_email,
                'mens_contact': mens_contact,
                'mens_state_register': mens_state_register,
                'mens_doc_type': mens_doc_type,
                'mens_doc': mens_doc
            }
            for key, mensage in mensages.items():
                if mensage != MENSAGE_SUCESS:
                    mensages_erro[key] = mensage
            if mensages_erro:
                return mensages_erro
            return MENSAGE_SUCESS
        
        def validateName(self, val: str) -> str:
            val_str = str(val) or ""
            if tamanhoExobitante(val_str) or len(val_str) < 8:
                return MENSAGE_ERRO['nome']
            if not re.match(r"^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$", val_str) or not val_str:
                return MENSAGE_ERRO['nome']
            return MENSAGE_SUCESS
        
        def documentType(self, val: str):
            val_str = str(val) or ""
            if not val_str in DOCUMENT_TYPE_LIST:
                return  MENSAGE_ERRO['tipo']
            return MENSAGE_SUCESS
        
        def cnpj(self, val: str):
            val_str = str(val) or ""
            if not val_str or not val_str.isdigit() or len(val_str) != 14:
                return MENSAGE_ERRO['cnpj']
            validator_cnpj = CNPJ()
            if not validator_cnpj.validate(val_str):
                return MENSAGE_ERRO['cnpj']
            return MENSAGE_SUCESS
        
        def cpf(self, val: str):
            val_str = str(val) or ""
            if not val_str or not val_str.isdigit() or len(val_str) != 11:
                return MENSAGE_ERRO['cpf']
            validator_cpf = CPF()
            if not validator_cpf.validate(val_str):
                return MENSAGE_ERRO['cpf']
            return MENSAGE_SUCESS
        
        def email(self, val: str):
            val_str = str(val) or ""
            if not val_str or tamanhoExobitante(val_str):
                return MENSAGE_ERRO['email']
            try:
                validate_email(val_str)
                return MENSAGE_SUCESS
            except ValidationError:
                return MENSAGE_ERRO['email']
            
        def contact(self, val: str):
            val_str = str(val) or ""
            if not val_str or not val_str.isdigit() or not len(val_str) in (10, 11):
                return MENSAGE_ERRO['número']
            try:
                number_formated = phonenumbers.parse(val_str, 'BR')
                if not phonenumbers.is_valid_number(number_formated):
                    return MENSAGE_ERRO['número']
                return MENSAGE_SUCESS
            except:
                return MENSAGE_ERRO['número']
        
        def stateRegister(self, val: str) -> str:
            val_str = str(val) or ""
            if not validateIE(val=val_str):
                return MENSAGE_ERRO['nscr']
            return MENSAGE_SUCESS
    
    #Clesse endereço, atrelada a um cliente
    class Adress:
        def forRegister(self, adress: Any):
            mensages_erro = {}
            mens_zone_code = self.validateZcode(adress.code_zone)
            mens_city = self.validateCity(adress.city)
            mens_people_place = self.validatePplace(adress.people_place)
            mens_neig_b = self.validateNeig(adress.neig_b)
            mens_number = self.validateNumberEst(adress.number)
            mens_type = self.adressType(adress.type)
            mensages = {
                'mens_zone_code': mens_zone_code,
                'mens_city': mens_city,
                'mens_people_place': mens_people_place,
                'mens_neig_b': mens_neig_b, 
                'mens_number': mens_number,
                'mens_type': mens_type
            }
            for key, mensage in mensages.items():
                if mensage != MENSAGE_SUCESS:
                    mensages_erro[key] = mensage 
            if mensages_erro:        
                return mensages_erro
            return MENSAGE_SUCESS
        
        def validateZcode(self, val: str) -> str:
            val_str = str(val) or ""
            if tamanhoExobitante(val_str)or  not val:
                return MENSAGE_ERRO["cep"]
            if len(val_str) == 8 and val_str.isdigit():
                return MENSAGE_SUCESS
            return MENSAGE_ERRO["cep"]
    
        def validateCity(self, val: str) -> str:
            val_str = str(val) or ""
            if tamanhoExobitante(val_str) or not val_str or len(val_str) < 4:
                return MENSAGE_ERRO['cidade']
            if not re.match(r"^[A-Za-zÀ-ÖØ-öø-ÿ'0-9\s]+$", val):
                return MENSAGE_ERRO['cidade']
            return MENSAGE_SUCESS
        
        def validatePplace(self, val: str) -> str:
            val_str = str(val) or ""
            if val_str not in PEOPLE_PLACE_LIST:
                return MENSAGE_ERRO['logradouro']
            return MENSAGE_SUCESS
        
        def validateNeig(self, val: str) -> str:
            val_str = str(val) or ""
            if tamanhoExobitante(val_str) or not val_str or len(val_str) < 4:
                return MENSAGE_ERRO['bairro']
            if not re.match(r"^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s.,-]+$", val_str):
                return MENSAGE_ERRO['bairro']
            return  MENSAGE_SUCESS
        
        def validateNumberEst(self, val: str) -> str:
            val_str = str(val) or ""
            if tamanhoExobitante(val_str) or not val_str or len(val_str) > 8:
                return MENSAGE_ERRO['num_estabelecimento']
            if not re.match(r"^[0-9]+$", val_str):
                return MENSAGE_ERRO['num_estabelecimento']
            return MENSAGE_SUCESS
        
        def adressType(self, val: str):
            val_str = str(val) or ""
            if not val_str in ADRESS_TYPE_LIST:
                return MENSAGE_ERRO['tipo endereço']
            return MENSAGE_SUCESS