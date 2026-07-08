STOCK_OPERATIONS_CHOICES = [
    ('CRIACAO', 'Criação'),
    ('REMOCAO', 'Remoção'),
    ('ADICAO', 'Adição'),
]

class Errors:
    STOCK_ALREADY_EXISTS = "Estoque já existe"
    STOCK_NOT_FOUND = "Estoque não encontrado"
    STOCK_ITEM_ALREADY_EXISTS = "Item já cadastrado"
    STOCK_ITEM_NOT_FOUND = "Item não encontrado no estoque"
    OPERATION_NOT_FOUND = "Operação não encontrada"
    MODELS_OPERATION = "Erro de operação no models"
    CONVERSION_ERROR = "Erro de conversão de dados"
    INVALID_CATEGORY = "Valor inválido para categoria"
    INVALID_PRODUCTS_LICENSED = "Valor de produto licenciado inválido"
    ITEM_NOT_INFORMATION = "Item não informado na requisição"
    INSUFICIENT_STOCK = "Estoque insuficiente para a operação"
    INVALID_STOCK_CODE = "Código de estoque inválido"
    INVALID_AMOUNT = "Valor de quantidade inválido"
    LIMIT_EXCEEDED = "Limite de estoque excedido"
    
class Success:
    STOCK_CREATED = "Estoque criado com sucesso"
    STOCK_UPDATED = "Estoque atualizado com sucesso"
    STOCK_DELETED = "Estoque excluído com sucesso"
    STOCK_ITEM_CREATED = "Item de estoque criado com sucesso"
    STOCK_ITEM_UPDATED = "Item de estoque atualizado com sucesso"
    STOCK_ITEM_DELETED = "Item de estoque excluído com sucesso"
    STOCK_DEACTIVATED = "Estoque desativado com sucesso"