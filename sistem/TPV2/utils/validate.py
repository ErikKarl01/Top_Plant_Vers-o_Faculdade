from constants.clientConstants import (DOCUMENT_TYPE, ADRESS_TYPE,
TYPE_PEOPLEPLACE_CHOICES)
from constants.orderConstantes import STATUS_ORDER_CHOICES
from constants.productConstants import PRODUCT_TYPE_CHOICES
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from validate_docbr import CNPJ, CPF
from typing import Any
from datetime import date
from datetime import datetime
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

PRODUCT_TYPES = [t[0] for t in PRODUCT_TYPE_CHOICES]

STATUS_ORDER_ = [t[0] for t in STATUS_ORDER_CHOICES]
    
CODE_MENSAGE_ERRO_VALIDATION = 'Campo código deve conter apenas letras e números, no mínimo 4 e no máximo 10 caractres'
DATE_MENSAGE_ERRO_VALIDATION = 'Intervalo de tempo inserido incorreto'

CLIENT_MENSAGE_ERRO_VALIDATION = {
    'nome': 'Campo nome inválido para cliente',
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

PRODUCT_MENSAGE_ERRO_VALIDATION = {
    'name': 'Campo nome inválido para produto',
    'price': 'Valor inserido é inválido, somente valor numérico aceito',
    'description': 'Campo descrição inválido',
    'type': 'Campo tipo inválido, permitido apenas Ornamental e Hortaliça',
    'licenced': 'Campo licenciado inválido',
    'measure': 'Unidade de medida incorreta'
}

STOCK_MENSAGE_ERRO_VALIDATION = {
    'stove_name': 'Campo nome do estoque inválido',
    'type_stock': 'Campo tipo de estoque inválido',
    'item_stock_amount': 'Campo quantidade deve ser um número inteiro entre 0 e 1000000'
}

ORDER_MENSAGE_ERRO_VALIDATION = {
    'price': 'Campo preço deve ser um número entre 0.0 e 1000000.0',
    'discount': 'Campo disconto deve ser um número entre 0.0 e 1000000.0',
    'status': 'Valor de status incorreto',
    'amount': 'Quantidade inserida é incorreta, deve ser um valor inteiro não inferior a 0 nem maior que 1000000'
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
            return CODE_MENSAGE_ERRO_VALIDATION
        if not re.match(r"^[A-Z0-9]+$", val_str):
            return CODE_MENSAGE_ERRO_VALIDATION
        return MENSAGE_SUCESS
    
    def validateFloat(self, val: float):
        try:
            val_int = float(val)
            if val_int < 0.0 or val_int > 1000000.0:
                return False
            return True
        except:
            return False
        
    def validateInt(self, val: int):
            try:
                val_int = int(val)
                if val_int < 0 or val_int > 1000000:
                    return False
                return True
            except:
                return False

    def validateDate(self, time_interval):
        if isinstance(time_interval, dict):
            try:
                start_date = datetime.strptime(time_interval['start'], "%d/%m/%Y").date()
                end_date = datetime.strptime(time_interval['end'], "%d/%m/%Y").date()
                if start_date > end_date:
                    return DATE_MENSAGE_ERRO_VALIDATION   
                return MENSAGE_SUCESS
            except (ValueError, KeyError, TypeError):
                return DATE_MENSAGE_ERRO_VALIDATION
        return DATE_MENSAGE_ERRO_VALIDATION
    
    class Client:
        def forRegister(self, client: Any):
            mens_doc_type = self.documentType(client.doc_type)
            mens_state_register = MENSAGE_SUCESS
            if mens_doc_type == MENSAGE_SUCESS:
                if client.doc_type == 'CNPJ' and client.state_register:
                    mens_doc = self.cnpj(client.doc)
                    mens_state_register = self.stateRegister(client.state_register)
                elif client.doc_type == 'CPF' and not client.state_register:
                    mens_doc = self.cpf(client.doc)
                else:
                    mens_doc = CLIENT_MENSAGE_ERRO_VALIDATION['doc_type_nao_informado']
            else:
                mens_doc = CLIENT_MENSAGE_ERRO_VALIDATION['doc_type_nao_informado']
            mensages_erro = {}
            mensages = {
                'mens_code': Validate().validateCode(client.code),
                'mens_name': self.validateName(client.name),
                'mens_email': self.email(client.email),
                'mens_contact': self.contact(client.contact),
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
                return CLIENT_MENSAGE_ERRO_VALIDATION['nome']
            if not re.match(r"^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$", val_str) or not val_str:
                return CLIENT_MENSAGE_ERRO_VALIDATION['nome']
            return MENSAGE_SUCESS
        
        def documentType(self, val: str):
            val_str = str(val) or ""
            if not val_str in DOCUMENT_TYPE_LIST:
                return  CLIENT_MENSAGE_ERRO_VALIDATION['tipo']
            return MENSAGE_SUCESS
        
        def cnpj(self, val: str):
            val_str = str(val) or ""
            if not val_str or not val_str.isdigit() or len(val_str) != 14:
                return CLIENT_MENSAGE_ERRO_VALIDATION['cnpj']
            validator_cnpj = CNPJ()
            if not validator_cnpj.validate(val_str):
                return CLIENT_MENSAGE_ERRO_VALIDATION['cnpj']
            return MENSAGE_SUCESS
        
        def cpf(self, val: str):
            val_str = str(val) or ""
            if not val_str or not val_str.isdigit() or len(val_str) != 11:
                return CLIENT_MENSAGE_ERRO_VALIDATION['cpf']
            validator_cpf = CPF()
            if not validator_cpf.validate(val_str):
                return CLIENT_MENSAGE_ERRO_VALIDATION['cpf']
            return MENSAGE_SUCESS
        
        def email(self, val: str):
            val_str = str(val) or ""
            if not val_str or tamanhoExobitante(val_str):
                return CLIENT_MENSAGE_ERRO_VALIDATION['email']
            try:
                validate_email(val_str)
                return MENSAGE_SUCESS
            except ValidationError:
                return CLIENT_MENSAGE_ERRO_VALIDATION['email']
            
        def contact(self, val: str):
            val_str = str(val) or ""
            if not val_str or not val_str.isdigit() or not len(val_str) in (10, 11):
                return CLIENT_MENSAGE_ERRO_VALIDATION['número']
            try:
                number_formated = phonenumbers.parse(val_str, 'BR')
                if not phonenumbers.is_valid_number(number_formated):
                    return CLIENT_MENSAGE_ERRO_VALIDATION['número']
                return MENSAGE_SUCESS
            except:
                return CLIENT_MENSAGE_ERRO_VALIDATION['número']
        
        def stateRegister(self, val: str) -> str:
            val_str = str(val) or ""
            if not validateIE(val=val_str):
                return CLIENT_MENSAGE_ERRO_VALIDATION['nscr']
            return MENSAGE_SUCESS
    
    #Clesse endereço, atrelada a um cliente
    class Adress:
        def forRegister(self, adress: Any):
            mensages = {
                'mens_zone_code': self.validateZcode(adress.code_zone),
                'mens_city': self.validateCity(adress.city),
                'mens_people_place': self.validatePplace(adress.people_place),
                'mens_neig_b': self.validateNeig(adress.neig_b), 
                'mens_number': self.validateNumberEst(adress.number),
                'mens_type': self.adressType(adress.type)
            }
            mensages_erro = {}
            for key, mensage in mensages.items():
                if mensage != MENSAGE_SUCESS:
                    mensages_erro[key] = mensage 
            if mensages_erro:        
                return mensages_erro
            return MENSAGE_SUCESS
        
        def validateZcode(self, val: str) -> str:
            val_str = str(val) or ""
            if tamanhoExobitante(val_str)or  not val:
                return CLIENT_MENSAGE_ERRO_VALIDATION["cep"]
            if len(val_str) == 8 and val_str.isdigit():
                return MENSAGE_SUCESS
            return CLIENT_MENSAGE_ERRO_VALIDATION["cep"]
    
        def validateCity(self, val: str) -> str:
            val_str = str(val) or ""
            if tamanhoExobitante(val_str) or not val_str or len(val_str) < 4:
                return CLIENT_MENSAGE_ERRO_VALIDATION['cidade']
            if not re.match(r"^[A-Za-zÀ-ÖØ-öø-ÿ'0-9 -]+$", val):
                return CLIENT_MENSAGE_ERRO_VALIDATION['cidade']
            return MENSAGE_SUCESS
        
        def validatePplace(self, val: str) -> str:
            val_str = str(val) or ""
            if val_str not in PEOPLE_PLACE_LIST:
                return CLIENT_MENSAGE_ERRO_VALIDATION['logradouro']
            return MENSAGE_SUCESS
        
        def validateNeig(self, val: str) -> str:
            val_str = str(val) or ""
            if tamanhoExobitante(val_str) or not val_str or len(val_str) < 4:
                return CLIENT_MENSAGE_ERRO_VALIDATION['bairro']
            if not re.match(r"^[A-Za-zÀ-ÖØ-öø-ÿ0-9 .,-]+$", val_str):
                return CLIENT_MENSAGE_ERRO_VALIDATION['bairro']
            return  MENSAGE_SUCESS
        
        def validateNumberEst(self, val: str) -> str:
            val_str = str(val) or ""
            if tamanhoExobitante(val_str) or not val_str or len(val_str) > 8:
                return CLIENT_MENSAGE_ERRO_VALIDATION['num_estabelecimento']
            if not re.match(r"^[0-9]+$", val_str):
                return CLIENT_MENSAGE_ERRO_VALIDATION['num_estabelecimento']
            return MENSAGE_SUCESS
        
        def adressType(self, val: str):
            val_str = str(val) or ""
            if not val_str in ADRESS_TYPE_LIST:
                return CLIENT_MENSAGE_ERRO_VALIDATION['tipo endereço']
            return MENSAGE_SUCESS
     
    # Classe validação de produto   
    class Product:
        def forRegister(self, product: Any):
            validate = Validate()
            mensages = {
                'mens_code': validate.validateCode(product.code),
                'mens_name': self.name(product.name),
                'mens_price': self.price(product.price),
                'mens_description': self.description(product.description),
                'mens_type': self.type(product.type),
                'mens_measure': self.measure(product.measure),
                'mens_licenced': self.licensed(product.licensed)
            }
            mensages_error = {}
            
            for key, value in mensages.items():
                if value != MENSAGE_SUCESS:
                    mensages_error[key] = value
            if mensages_error:
                return mensages_error
            return MENSAGE_SUCESS
        
        def name(self, val: str):
            val_str = str(val)
            if tamanhoExobitante(val=val_str) or not val or len(val) < 4:
                return PRODUCT_MENSAGE_ERRO_VALIDATION['name']
            if not re.match(r"^[A-Za-zÀ-ÖØ-öø-ÿ'0-9 -]+$", val_str):
                return PRODUCT_MENSAGE_ERRO_VALIDATION['name']
            return MENSAGE_SUCESS
        
        def description(self, val: str):
            val_str = str(val) or ''
            if not val_str:
                return MENSAGE_SUCESS
            if tamanhoExobitante(val=val_str)  or len(val_str) < 4:
                return PRODUCT_MENSAGE_ERRO_VALIDATION['description']
            if not re.match(r"^[A-Za-zÀ-ÖØ-öø-ÿ'0-9 -]+$", val_str):
                return PRODUCT_MENSAGE_ERRO_VALIDATION['description']
            return MENSAGE_SUCESS
        
        def type(self, val: str):
            val_str = str(val)
            if tamanhoExobitante(val=val_str) or not val_str:
                return PRODUCT_MENSAGE_ERRO_VALIDATION['type']
            if not val_str in PRODUCT_TYPES:
                return PRODUCT_MENSAGE_ERRO_VALIDATION['type']
            return MENSAGE_SUCESS
        
        def price(val: float):
            validate = Validate()
            if not validate.validateFloat(val=val):
                return PRODUCT_MENSAGE_ERRO_VALIDATION['price']
            return MENSAGE_SUCESS
        
        def licensed(self, val: bool):
            try:
                val_bool = bool(val)
                if not isinstance(val_bool, bool):
                    return PRODUCT_MENSAGE_ERRO_VALIDATION['licenced']
                return MENSAGE_SUCESS
            except:
                return PRODUCT_MENSAGE_ERRO_VALIDATION['licenced']
        
        def measure(self, val: str):
            val_str = str(val)
            if tamanhoExobitante(val=val_str) or not val_str:
                return PRODUCT_MENSAGE_ERRO_VALIDATION['measure']
            if not re.match(r"^[A-Za-z/,.-]+$", val_str):
                return PRODUCT_MENSAGE_ERRO_VALIDATION['measure']
            return MENSAGE_SUCESS
        
    class Stock:
        def forRegister(self, stock: Any):
            mensages = {
                'mens_stove_name': self.stoveName(stock.stove_name),
                'type_stock': self.stock_type(stock.category)
            }
            mensages_error = []
            if mensages.get('mens_stove_name'):
                mensages_error.append(mensages.get('mens_stove_name'))
            if mensages.get('type_stock'):
                mensages_error.append(mensages.get('type_stock'))
            if mensages_error:
                return mensages_error
            return MENSAGE_SUCESS
        
        def code(self, val: str) -> str:
            val_str = str(val) or ""
            if tamanhoExobitante(val_str) or len(val_str) > 20 or len(val_str) < 4 or not val_str:
                return CODE_MENSAGE_ERRO_VALIDATION
            if not re.match(r"^[A-Z0-9]+$", val_str.upper()):
                return CODE_MENSAGE_ERRO_VALIDATION
            return MENSAGE_SUCESS
        
        def stoveName(self, val: str):
            val_str = str(val)
            if tamanhoExobitante(val=val_str) or not val_str or len(val_str) < 4:
                return PRODUCT_MENSAGE_ERRO_VALIDATION['name']
            if not re.match(r"^[A-Za-zÀ-ÖØ-öø-ÿ'0-9 -]+$", val_str):
                return PRODUCT_MENSAGE_ERRO_VALIDATION['name']
            return MENSAGE_SUCESS
        
        def amount(val: float):
            validate = Validate()
            if not validate.validateInt(val=val):
                return STOCK_MENSAGE_ERRO_VALIDATION['item_stock_amount']
        
        def stock_type(self, val: str):
            val_str = str(val)
            if tamanhoExobitante(val=val_str) or not val_str or not val_str in PRODUCT_TYPES:
                return STOCK_MENSAGE_ERRO_VALIDATION['type_stock']
            return MENSAGE_SUCESS
            
    class Oder:        
        def code(self, val: str) -> str:
            val_str = str(val) or ""
            if tamanhoExobitante(val_str) or len(val_str) > 20 or len(val_str) < 4 or not val_str:
                return CODE_MENSAGE_ERRO_VALIDATION
            if not re.match(r"^[A-Z0-9]+$", val_str.upper()):
                return CODE_MENSAGE_ERRO_VALIDATION
            return MENSAGE_SUCESS
        
        def validatePrice(self, val: float):
            validate = Validate()
            if not validate.validateFloat(val=val):
                return ORDER_MENSAGE_ERRO_VALIDATION['price']
            return MENSAGE_SUCESS
         
        def validateDiscount(self, val: float):
            validate = Validate()
            if not validate.validateFloat(val=val):
                return ORDER_MENSAGE_ERRO_VALIDATION['discount']
            return MENSAGE_SUCESS   
        
        def validateAmount(self, val: int):
            validate = Validate()
            if not validate.validateInt(val=val):
                return ORDER_MENSAGE_ERRO_VALIDATION['amount']
            return MENSAGE_SUCESS   
        
        def status(self, val: str):
            val_str = str(val) or ''
            if tamanhoExobitante(val=val_str) or not val_str or not val_str in STATUS_ORDER_:
                return ORDER_MENSAGE_ERRO_VALIDATION['status']
            return MENSAGE_SUCESS