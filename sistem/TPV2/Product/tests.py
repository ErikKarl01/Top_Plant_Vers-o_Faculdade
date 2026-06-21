from django.test import TestCase
from django.db import IntegrityError

# Ajuste os imports abaixo conforme a estrutura de pastas do seu projeto
from utils.validate import Validate, MENSAGE_SUCESS
from utils.toClean import ToClean
from Product.models import Product
from constants.productConstants import PRODUCT_TYPE_CHOICES

class ProductValidationTest(TestCase):
    def setUp(self):
        self.val = Validate.Product()
        self.val_code = Validate()
        self.clean = ToClean()
        
        # Pega a lista de tipos válidos para usar nos testes
        self.valid_types = [t[0] for t in PRODUCT_TYPE_CHOICES]

    def test_P_CT01_codigo(self):
        # Casos de sucesso: 4 a 10 caracteres, alfanumérico uppercase
        codigos_validos = ["PROD", "PROD01", "1234567890", "A1B2C3D4"]
        for codigo in codigos_validos:
            codigo_limpo = self.clean.alphaNumeric(codigo)
            self.assertEqual(self.val_code.validateCode(codigo_limpo), MENSAGE_SUCESS)

        # Casos de falha: menor que 4, maior que 10, caracteres especiais
        codigos_invalidos = ["PR", "PROD0000001", "PROD@1", "PROD-1", ""]
        for codigo in codigos_invalidos:
            # Simulando o que passaria direto ou quebrando no regex
            self.assertNotEqual(self.val_code.validateCode(codigo), MENSAGE_SUCESS)

    def test_P_CT02_nome(self):
        # Casos de sucesso: mínimo 4 caracteres, letras, números, espaços, hífen
        nomes_validos = ["Ração Premium", "Adubo NPK 10-10-10", "Pá de Bico", "Semente's"]
        for nome in nomes_validos:
            nome_limpo = self.clean.name(nome)
            self.assertEqual(self.val.name(nome_limpo), MENSAGE_SUCESS)

        # Casos de falha: menor que 4, caracteres não permitidos (!, @, _, etc)
        nomes_invalidos = ["Pá", "Ração@", "Adubo_Top", "Sementes!", ""]
        for nome in nomes_invalidos:
            self.assertNotEqual(self.val.name(nome), MENSAGE_SUCESS)

    def test_P_CT03_descricao(self):
        # Casos de sucesso: mínimo 8 caracteres
        descricoes_validas = ["Produto de alta qualidade", "Serve para plantas - uso geral"]
        for desc in descricoes_validas:
            # Simulando a limpeza (supondo que ToClean tem um text())
            desc_limpa = self.clean.text(desc) if hasattr(self.clean, 'text') else desc
            self.assertEqual(self.val.description(desc_limpa), MENSAGE_SUCESS)

        # Casos de falha: menor que 8, caracteres não permitidos
        descricoes_invalidas = ["Curta", "Desc@", ""]
        for desc in descricoes_invalidas:
            self.assertNotEqual(self.val.description(desc), MENSAGE_SUCESS)

    def test_P_CT04_preco_e_desconto(self):
        # Casos de sucesso: floats entre 0.0 e 1000000
        valores_validos = [0.0, 10.5, 999.99, 1000000.0, "50.5"]
        for valor in valores_validos:
            self.assertEqual(self.val.priceAndDiscount(valor), MENSAGE_SUCESS)

        # Casos de falha: negativo, maior que 1000000, ou string não convertível
        valores_invalidos = [-1.0, -50.0, 1000000.1, "Cem reais", ""]
        for valor in valores_invalidos:
            self.assertNotEqual(self.val.priceAndDiscount(valor), MENSAGE_SUCESS)

    def test_P_CT05_tipo(self):
        # Casos de sucesso dependem de PRODUCT_TYPE_CHOICES (Ex: 'Ornamental', 'Hortaliça')
        if self.valid_types:
            tipo_valido = self.valid_types[0]
            self.assertEqual(self.val.type(tipo_valido), MENSAGE_SUCESS)

        # Casos de falha: fora da lista
        tipos_invalidos = ["Eletrônico", "Alimento", "", "123"]
        for tipo in tipos_invalidos:
            self.assertNotEqual(self.val.type(tipo), MENSAGE_SUCESS)

    def test_P_CT06_medida(self):
        # Casos de sucesso: regex ^[A-Za-z/,.-]+$
        medidas_validas = ["kg", "L/h", "m.sq", "cm-mm"]
        for medida in medidas_validas:
            # Usando Validate.Product.measure pois falta o 'self' na declaração do seu código original
            self.assertEqual(Validate.Product.measure(medida), MENSAGE_SUCESS)

        # Casos de falha: números, espaços
        medidas_invalidas = ["10kg", "kg ", " kg", ""]
        for medida in medidas_invalidas:
            self.assertNotEqual(Validate.Product.measure(medida), MENSAGE_SUCESS)


class ProductModelIssuesTest(TestCase):
    '''
    Testes focados em garantir que as restrições Unique (código e nome)
    sejam barradas corretamente no banco.
    '''
    def setUp(self):
        # Cria um produto base para testar colisões
        self.product_base = Product.objects.create(
            code="BASE01",
            name="Produto Base",
            price=10.0,
            discount=0.0,
            description="Descricao valida base",
            type=PRODUCT_TYPE_CHOICES[0][0] if PRODUCT_TYPE_CHOICES else "DEFAULT",
            measure="kg",
            licensed=True
        )

    def test_P_CT07_codigo_duplicado(self):
        with self.assertRaises(IntegrityError):
            Product.objects.create(
                code="BASE01", # MESMO CÓDIGO
                name="Produto Dois",
                price=15.0,
                discount=0.0,
                description="Descricao do produto dois",
                type=PRODUCT_TYPE_CHOICES[0][0] if PRODUCT_TYPE_CHOICES else "DEFAULT",
                measure="kg",
                licensed=True
            )

    def test_P_CT08_nome_duplicado(self):
        with self.assertRaises(IntegrityError):
            Product.objects.create(
                code="BASE02", 
                name="Produto Base", # MESMO NOME
                price=15.0,
                discount=0.0,
                description="Descricao do produto tres",
                type=PRODUCT_TYPE_CHOICES[0][0] if PRODUCT_TYPE_CHOICES else "DEFAULT",
                measure="kg",
                licensed=True
            )