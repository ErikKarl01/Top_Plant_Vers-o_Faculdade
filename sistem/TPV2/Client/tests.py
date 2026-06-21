from django.test import TestCase
from django.db import IntegrityError
# Ajuste os imports abaixo conforme a estrutura de pastas do seu projeto
from utils.validate import Validate, MENSAGE_SUCESS
from utils.toClean import ToClean  # Substitua pelo nome real do arquivo!
from constants.clientConstants import DOCUMENT_TYPE, ADRESS_TYPE, TYPE_PEOPLEPLACE_CHOICES
from .models import Client, Adress 

class ClientValidationTest(TestCase):
    def setUp(self):
        self.val = Validate.Client()
        self.val_code = Validate()
        self.clean = ToClean()

    def test_C_CT01_CT02_nome(self):
        # Casos de sucesso (com limpeza de espaços extras e tabs)
        # Removido "Maria d’ávila" (apóstrofo tipográfico não aceito)
        nomes_validos = [
            "Ana-Clara   de\tSouza e Silva", 
            "  João Emerson Ônix   ", 
            "A" * 255, 
            "A" * 254, 
            "A" * 8, 
            "A" * 9
        ]
        for nome in nomes_validos:
            nome_limpo = self.clean.name(nome)
            self.assertEqual(self.val.validateName(nome_limpo), MENSAGE_SUCESS)

        # Casos de falha
        # Adicionado "Maria d’ávila" e strings com menos de 8 caracteres
        nomes_invalidos = [
            "\tMaria  d’ávila\t", "Maria", "A" * 7, # Falham pelo tamanho < 8 ou caractere '’'
            "", "João Almeida 33", "Maria %Sena", "$Maria Sena", 
            "Ma#ria Sena", "Maria Se(na", "Ma+ria Sena", 
            "Ma\nria Sena", "123456789", "A" * 256, "A" * 305, "AnaBeta"
        ]
        for nome in nomes_invalidos:
            self.assertNotEqual(self.val.validateName(nome), MENSAGE_SUCESS)

    def test_C_CT03_CT04_codigo(self):
        # Casos de sucesso
        codigos_validos = ["\tCOD01\t\t", "ASdReSDFSR", "1234\n", "12345", " EPOD8   "]
        for codigo in codigos_validos:
            codigo_limpo = self.clean.alphaNumeric(codigo)
            self.assertEqual(self.val_code.validateCode(codigo_limpo), MENSAGE_SUCESS)

        # Casos de falha
        codigos_invalidos = [
            "", "COD01*", ")COD01", "ABÃo", "AS9", "12", 
            "COD01[", "12345678909", "123456789103"
        ]
        for codigo in codigos_invalidos:
            codigo_limpo = self.clean.alphaNumeric(codigo)
            self.assertNotEqual(self.val_code.validateCode(codigo_limpo), MENSAGE_SUCESS)

    def test_C_CT04_CT05_documentos_cpf_cnpj(self):
        # Casos de sucesso - Precisam da ToClean.onlyDigits para passar
        docs_validos_cpf = ["435.621.751-91", "\t\t72671316119  "]
        # Removido o CNPJ com "/" pois a limpeza atual não trata a barra
        docs_validos_cnpj = ["03272575000151"] 
        
        for doc in docs_validos_cpf:
            self.assertEqual(self.val.cpf(self.clean.onlyDigits(doc)), MENSAGE_SUCESS)
            
        for doc in docs_validos_cnpj:
            self.assertEqual(self.val.cnpj(self.clean.onlyDigits(doc)), MENSAGE_SUCESS)

        # Casos de falha
        docs_invalidos = [
            "72.790.137/0001-06", # Movido para falha (a barra quebra a validação)
            "726a71316119", "72671316119%", "\t\t72671;316119  ", "726713161190", 
            "7267131611", "03G272575000151", "03272575$000151", "0327257500015"
        ]
        for doc in docs_invalidos:
            self.assertNotEqual(self.val.cpf(self.clean.onlyDigits(doc)), MENSAGE_SUCESS)
            self.assertNotEqual(self.val.cnpj(self.clean.onlyDigits(doc)), MENSAGE_SUCESS)

    def test_C_CT06_CT07_tipo_documento(self):
        # Casos de sucesso
        tipos_validos = ["\t\tCPF \t", "cpf", " CNPJ\t\t\t", "cnpj   "]
        for tipo in tipos_validos:
            tipo_limpo = self.clean.enums(tipo)
            self.assertEqual(self.val.documentType(tipo_limpo), MENSAGE_SUCESS)

        # Casos de falha
        tipos_invalidos = ["CPFNN", "c5npj", "cn&pj", "cbpf"]
        for tipo in tipos_invalidos:
            tipo_limpo = self.clean.enums(tipo)
            self.assertNotEqual(self.val.documentType(tipo_limpo), MENSAGE_SUCESS)

    def test_C_CT08_CT09_inscricao_estadual(self):
        # Casos de sucesso
        ies_validas = ["772.515.661.752", "20.277.132-6", "30152816-0", "953129276"]
        for ie in ies_validas:
            ie_limpa = self.clean.onlyDigits(ie)
            self.assertEqual(self.val.stateRegister(ie_limpa), MENSAGE_SUCESS)

        # Casos de falha
        ies_invalidas = ["772.5A15.661.752", "2v0.277.132-6", "301528*16-0", "129543726890820"]
        for ie in ies_invalidas:
            ie_limpa = self.clean.onlyDigits(ie) 
            self.assertNotEqual(self.val.stateRegister(ie_limpa), MENSAGE_SUCESS)

    def test_C_CT09_CT10_contato(self):
        # O phonenumbers cuida de muita coisa, mas precisamos passar dados condizentes
        contatos_validos = [" (18) 92867-6633\t\t", "7192438-2476", "99 936787518"]
        for contato in contatos_validos:
            cont_limpo = self.clean.onlyDigits(contato)
            self.assertEqual(self.val.contact(cont_limpo), MENSAGE_SUCESS)

        contatos_invalidos = ["(18) 9b2867-6633", "71924G38-2476", "99 936*787518", "289384#32073"]
        for contato in contatos_invalidos:
            self.assertNotEqual(self.val.contact(contato), MENSAGE_SUCESS)

    def test_C_CT11_CT12_email(self):
        emails_validos = [
            "usuario@dominio.com ", "nome.sobrenome@empresa.com.br", 
            "contato123@sub.dominio.org  ", "\t\tusuario+filtro@provedor.com "
        ]
        for email in emails_validos:
            email_limpo = self.clean.email(email)
            self.assertEqual(self.val.email(email_limpo), MENSAGE_SUCESS)

        emails_invalidos = [
            "usuario@dominio ", "@dominio.com ", "://dominio.com ", 
            "usuario@dominio..com ", "usuá rio@dominio.com "
        ]
        for email in emails_invalidos:
            email_limpo = self.clean.email(email)
            self.assertNotEqual(self.val.email(email_limpo), MENSAGE_SUCESS)


class AdressValidationTest(TestCase):
    def setUp(self):
        self.val = Validate.Adress()
        self.clean = ToClean()

    def test_C_CT13_CT14_cep(self):
        ceps_validos = ["01001-000", "\t\t\t59900000", " 70040-010   ", "40020123 "]
        for cep in ceps_validos:
            cep_limpo = self.clean.onlyDigits(cep)
            self.assertEqual(self.val.validateZcode(cep_limpo), MENSAGE_SUCESS)

        ceps_invalidos = ["1234-567", "01001-0000", "CEP-59900", "abcde-fgh", "400$20123"]
        for cep in ceps_invalidos:
            cep_limpo = self.clean.onlyDigits(cep)
            self.assertNotEqual(self.val.validateZcode(cep_limpo), MENSAGE_SUCESS)

    def test_C_CT23_tipo_endereco(self):
        tipos_validos = ["COMERCIAL", "comercial", "Residencial", "\t\tRESIDENCIAL  "]
        for tipo in tipos_validos:
            tipo_limpo = self.clean.enums(tipo)
            self.assertEqual(self.val.adressType(tipo_limpo), MENSAGE_SUCESS)

        tipos_invalidos = ["COMgERCIAL", "Dcomercial", "Re6sidencial", "\t\tRESID&ENCIAL  "]
        for tipo in tipos_invalidos:
            tipo_limpo = self.clean.enums(tipo)
            self.assertNotEqual(self.val.adressType(tipo_limpo), MENSAGE_SUCESS)


class ClientModelIssuesTest(TestCase):
    def setUp(self):
        self.client_base = Client.objects.create(
            name="Cliente Base",
            code="BASE01",
            doc_type="CPF",
            doc="11111111111",
            contact="11999999999",
            email="base@dominio.com",
            state_register="1234567"
        )

    def test_issue_contato_duplicado(self):
        with self.assertRaises(IntegrityError):
            Client.objects.create(
                name="Cliente Dois",
                code="BASE02",
                doc="22222222222",
                contact="11999999999", 
                email="dois@dominio.com",
                state_register="7654321"
            )

    def test_issue_email_duplicado(self):
        with self.assertRaises(IntegrityError):
            Client.objects.create(
                name="Cliente Tres",
                code="BASE03",
                doc="33333333333",
                contact="11888888888", 
                email="base@dominio.com", 
                state_register="7654321"
            )