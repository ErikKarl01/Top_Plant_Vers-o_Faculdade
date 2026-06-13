DOCUMENT_TYPE = [
    ("CPF", "cpf"),
    ("CNPJ", "cnpj")
]

ADRESS_TYPE = [
    ("COMERCIAL", "Comercial"),
    ("RESIDENCIAL", "Residencial")
]

TYPE_PEOPLEPLACE_CHOICES = [
    ("RUA", "Rua"),
    ("AVENIDA", "Avenida"),
    ("TRAVESSA", "Travessa"),
    ("ALAMEDA", "Alameda"),
    ("PRACA", "Praça"),
    ("ESTRADA", "Estrada"),
    ("RODOVIA", "Rodovia"),
    ("VIA", "Via"),
    ("LARGO", "Largo"),
    ("BECO", "Beco"),
    ("VIELA", "Viela"),
    ("SERVIDAO", "Servidão"),
    ("PASSAGEM", "Passagem"),
    ("QUADRA", "Quadra"),
    ("CONDOMINIO", "Condomínio"),
    ("CHACARA", "Chácara"),
    ("SITIO", "Sítio"),
    ("FAZENDA", "Fazenda"),
    ("LOTEAMENTO", "Loteamento"),
    ("RECANTO", "Recanto"),
    ("COLONIA", "Colônia"),
    ("PARQUE", "Parque"),
    ("CONJUNTO", "Conjunto"),
]


class Errors:
    CLIENT_NOT_FOUND = 'Cliente não encontrado.'
    CLIENT_ALREADY_EXISTS = 'Cliente já existe com este cpf, cnpj ou código único.'
    ADRESS_ALREADY_EXISTS = 'Já existe um cliente com esse endereço cadastrado.'
    CONVERSION_ERROR = 'Erro durante a conversão de objetos.'
    MODELS_ERROR = 'Erro de operação no models.'
    CLIENT_HAS_ADRESS = 'O cliente escolhido já possui endereço cadastrado.'
    SEARCH_ERROR = 'Erro ao inserir os dados, verifique se os dados de busca estão corretos.'
    NULL_LIST = 'Nenhum cliente cadastrado.'
    SAVE_ERRO = 'Erro ao salvar objeto no banco de dados'
    
class Success:
    CLIENT_REGISTERED = 'Cliente cadastrado com sucesso'
    CLIENT_MODIFIED = 'Dados de cliente modificados com sucesso'
    CLIENT_DELETED = 'Cliente excluído com sucesso'
    ADRESS_REGISTERED = 'Endereço cadastrado com sucesso'
    ADRESS_MODIFIED = 'Endereço modificado com sucesso'
    ADRESS_DELETED = 'Endereço excluído com sucesso'
    RETURN = 'Busca bem sucedida'