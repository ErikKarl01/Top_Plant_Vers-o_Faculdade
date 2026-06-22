
STATUS_ORDER_CHOICES = [
    ('PENDENTE', 'Pendente'),
    ('PARCIALMENTE ATENDIDO', 'Parcialmente Atendido'),
    ('FINALIZADO', 'Finalizado')
]

class Errors:
    ORDER_DONT_EXISTS = "Pedido não encontrado."
    MODELS_ERROR = "Erro na operação do models."
    ITEM_ORDER_NOT_FOUND = "Item de pedido não encontrado."
    DICOUNT_BIGGER_PRICE = "Não é permitido um valor de disconto maior ou igual ao preço do produto"
    CONVERSION_ERROR = "Erro de conversão de pedido ou item"

class Success:
    ORDER_DELETE_SUCEFULD = "Pedido excluído com sucesso"
    ORDER_MODIFIED_SUCEFULD = "Pedido modificado com sucesso"
    ORDER_CREATED_SUCEFULD = "Pedido criado com sucesso"
    ORDER_RETURNED_SUCEFULD = "Pedido(s) encontrado(s) com sucesso"
    ITEM_ORDER_CREATED_SUCEFULD =  "Item criado com sucesso"
    ITEM_ORDER_RETURNED_SUCEFULD = "Item de pedido encontrado com sucesso."
    ITEM_ORDER_MODIFIED_SUCEFULD = "Item de pedido modificado com sucesso."
    