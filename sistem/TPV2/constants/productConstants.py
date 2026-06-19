
PRODUCT_TYPE_CHOICES  = [
    ('HORTALICAS', 'Hortaliças'),
    ('ORNAMENTAIS', 'Ornamentais')
]

class Errors:
    PRODUCT_ALREADY_EXISTS = 'Produto já cadastrado.'
    NAME_ALREADY_EXISTS = 'Nome do produto já cadastrado.'
    PRODUCT_NOT_FOUND = 'Produto não encontrado.'
    CONVERSION_ERROR = 'Erro durante a conversão de objetos.'
    MODELS_ERROR = 'Erro de operação no models.'
    
class Success:
    PRODUCT_REGISTERED = 'Produto cadastrado com sucesso.'
    PRODUCT_MODIFIED = 'Dados de produto modificados com sucesso.'
    PRODUCT_DELETED = 'Produto excluído com sucesso.'
    RETURN = 'Busca bem sucedida.'
    PRODUCT_MODIFIED_PRICE = 'Preço do produto modificado com sucesso.'