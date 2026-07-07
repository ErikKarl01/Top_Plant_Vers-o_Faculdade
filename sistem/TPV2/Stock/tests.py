from django.test import TestCase
from unittest.mock import patch, MagicMock

from Stock.service.stockService import StockService
from Stock.service.stockItemService import StockItemService
from sistem.TPV2.Stock.service import ServiceCentralize
from constants.responseClass import Response

# IMPORTAÇÃO CRUCIAL PARA OS TESTES BATEREM COM O SERVICE
from utils.validate import MENSAGE_SUCESS 

class StockItemServiceTest(TestCase):
    def setUp(self):
        self.item_service = StockItemService()

    @patch('Stock.service.stockItemService.Validate.Stock.amount')
    @patch('Stock.service.stockItemService.Validate.validateCode')
    @patch('Stock.service.stockItemService.StockItem.stockItemReturn')
    @patch('Stock.service.stockItemService.StockItem.stockItemUpdate')
    def test_stockItemUpdateAmount_remocao_com_sucesso(self, mock_update, mock_return, mock_val_code, mock_val_amount):
        # Usando a constante exata do seu sistema
        mock_val_amount.return_value = MENSAGE_SUCESS
        mock_val_code.return_value = MENSAGE_SUCESS
        
        mock_item = MagicMock()
        mock_item.amount = 50
        mock_return.return_value = mock_item
        
        mock_item_atualizado = MagicMock()
        mock_item_atualizado.amount = 40
        mock_update.return_value = mock_item_atualizado

        response = self.item_service.stockItemUpdateAmount(
            product_code="PROD-123", 
            operation_type="REMOCAO", 
            amount_changed=10
        )

        self.assertTrue(response.sucess)
        self.assertEqual(response.value['item'].amount, 40)
        self.assertEqual(response.value['before_value'], 50)
        mock_update.assert_called_once_with(product_code="PROD-123", amount=40)

    @patch('Stock.service.stockItemService.Validate.Stock.amount')
    @patch('Stock.service.stockItemService.Validate.validateCode')
    @patch('Stock.service.stockItemService.StockItem.stockItemReturn')
    def test_stockItemUpdateAmount_limite_negativo_erro(self, mock_return, mock_val_code, mock_val_amount):
        mock_val_amount.return_value = MENSAGE_SUCESS
        mock_val_code.return_value = MENSAGE_SUCESS
        
        mock_item = MagicMock()
        mock_item.amount = 50
        mock_return.return_value = mock_item

        response = self.item_service.stockItemUpdateAmount(
            product_code="PROD-123", 
            operation_type="REMOCAO", 
            amount_changed=60
        )

        self.assertFalse(response.sucess)
        self.assertEqual(response.status, 400)
        self.assertEqual(response.menssage, "Erro: Quantidade não pode ficar negativa.")

    @patch('Stock.service.stockItemService.Validate.Stock.amount')
    @patch('Stock.service.stockItemService.Validate.validateCode')
    @patch('Stock.service.stockItemService.StockItem.stockItemReturn')
    def test_stockItemUpdateAmount_limite_maximo_erro(self, mock_return, mock_val_code, mock_val_amount):
        mock_val_amount.return_value = MENSAGE_SUCESS
        mock_val_code.return_value = MENSAGE_SUCESS
        
        mock_item = MagicMock()
        mock_item.amount = 900000
        mock_return.return_value = mock_item

        response = self.item_service.stockItemUpdateAmount(
            product_code="PROD-123", 
            operation_type="ADICAO", 
            amount_changed=200000
        )

        self.assertFalse(response.sucess)
        self.assertEqual(response.status, 400)
        self.assertEqual(response.menssage, "Erro: Quantidade ultrapassa limite de 1000000.")


class ServiceCentralizeTest(TestCase):
    def setUp(self):
        self.centralizer = ServiceCentralize()

    @patch('Stock.service.serviceCentralize.StockService.stockDelete')
    def test_deleteStockResponse_sucesso(self, mock_stockDelete):
        resposta_fake = Response().sucessMens(mensage="Estoque deletado", value=None)
        mock_stockDelete.return_value = resposta_fake

        resultado = self.centralizer.deleteStockResponse(stock_code="STK-001")

        mock_stockDelete.assert_called_once_with(stock_code="STK-001")
        self.assertTrue(resultado['sucess'])
        
        # Correção: Verificando se a chave é 'menssage' ou 'mensage' ou 'message'
        mensagem_retornada = resultado.get('menssage') or resultado.get('mensage') or resultado.get('message')
        self.assertEqual(mensagem_retornada, "Estoque deletado")
        self.assertIsNone(resultado['value'])

    @patch('Stock.service.serviceCentralize.cleanStockData')
    @patch('Stock.service.serviceCentralize.ConvertStock.toDict')
    @patch('Stock.service.serviceCentralize.StockService.stockModify')
    def test_modifyStockResponse_sucesso_com_conversao(self, mock_modify, mock_toDict, mock_clean):
        mock_clean.return_value = {'stove_name': 'Forno Limpo', 'stock_code': 'STK001'}
        
        mock_model = MagicMock()
        mock_modify.return_value = Response().sucessMens(mensage="Modificado", value=mock_model)
        
        mock_toDict.return_value = {'id': 1, 'name': 'Forno Limpo', 'code': 'STK001'}

        resultado = self.centralizer.modifyStockResponse(stove_name=" Forno Sujo ", stock_code="stk-001")

        mock_clean.assert_called_once_with(stove_name=" Forno Sujo ", stock_code="stk-001")
        mock_modify.assert_called_once_with(stove_name="Forno Limpo", stock_code="STK001")
        mock_toDict.assert_called_once_with(stock=mock_model)
        
        self.assertTrue(resultado['sucess'])
        self.assertEqual(resultado['value'], {'id': 1, 'name': 'Forno Limpo', 'code': 'STK001'})