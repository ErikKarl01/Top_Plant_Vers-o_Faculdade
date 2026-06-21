from utils.converet.convertClient import ConvertClient, ConvertAdress
from utils.format import FormatToReturn
from Client.dto import AdressDTO
from utils.validate import Validate, MENSAGE_SUCESS
from Client.models import Client, Adress
from constants.clientConstants import Errors, Success
from constants.responseClass import Response


class AdressService:
    validate = Validate()
    convert_client = ConvertClient()
    convert_adress = ConvertAdress()
    formatToReturn = FormatToReturn()
    c_model = Client()
    a_model = Adress()
      
    def adressSave(self, adressDTO: AdressDTO, code_client: str) -> Response:
        mens_validate = self.validate.Adress().forRegister(adressDTO)
        if mens_validate != MENSAGE_SUCESS:
            return Response().erroMens(mensage=mens_validate, status=400)
        if self.a_model.adressExists(adressDTO):
            return Response().erroMens(mensage=Errors.ADRESS_ALREADY_EXISTS, status=409)
        if self.c_model.clientHasAdress(code_client=code_client):
            return Response().erroMens(menssage=Errors.CLIENT_HAS_ADRESS, status=409)
        try:
            adress_model = self.convert_adress.toModel(adressDTO)
        except Exception:
            return Response().erroMens(menssage=Errors.CONVERSION_ERROR, status=500)
        try:
            if not self.a_model.adressSave(adress=adress_model, code_client=code_client):
                return Response().erroMens(menssage=Errors.SAVE_ERRO, status=500)
        except Exception:
            return Response().erroMens(menssage=Errors.MODELS_ERROR, status=500)
        return Response().sucessMens(mensage=Success.ADRESS_REGISTERED, value=adress_model)
    
    
    def adressModify(self, code_client: str, adressDTO: AdressDTO) -> Response:
        validate_code = self.validate.validateCode(code_client)
        mens_validate = self.validate.Adress().forRegister(adressDTO)
        if validate_code != MENSAGE_SUCESS:
            return Response().erroMens(menssage=validate_code, status=409)
        if not self.c_model.clientExists(code_client=code_client):
            return Response().erroMens(menssage=Errors.CLIENT_NOT_FOUND, status=404)
        if mens_validate != MENSAGE_SUCESS:
            return Response().erroMens(menssage=mens_validate, status=409)
        try:
            adress_model = self.convert_adress.toModel(adressDTO)
        except Exception:
            return Response().erroMens(menssage=Errors.CONVERSION_ERROR, status=500)
        try:
            self.a_model.adressModify(adress=adress_model)
        except Exception:
            return Response().erroMens(mensage=Errors.MODELS_ERROR, status=500)
        return Response().sucessMens(mensage=Success.ADRESS_MODIFIED, value=adress_model)
    
    
    def adressDelete(self, code_client: str) -> Response:
        validate_code = self.validate.validateCode(code_client)
        if validate_code != MENSAGE_SUCESS:
            return Response().erroMens(menssage=validate_code, status=409)
        if not self.c_model.clientExists(code_client=code_client):
            return Response().erroMens(menssage=Errors.CLIENT_NOT_FOUND, status=404)
        try:
            self.a_model.adressDelete(code_client=code_client)
        except Exception:
            return Response().erroMens(menssage=Errors.MODELS_ERROR, status=500)
        return Response().sucessMens(mensage=Success.ADRESS_DELETED, value=None)
    
    
    def adressReturn(self, code_client: str) -> Response:
        validate_code = self.validate.validateCode(code_client)
        if validate_code != MENSAGE_SUCESS:
            return Response().erroMens(menssage=validate_code, status=409)
        if not self.c_model.clientExists(code_client=code_client):
            return Response().erroMens(menssage=Errors.CLIENT_NOT_FOUND, status=404)
        try:
            adress_model = self.a_model.adressReturn(code_client=code_client)
        except Exception:
            return Response().erroMens(menssage=Errors.MODELS_ERROR, status=500)
        return Response().sucessMens(mensage=Success.RETURN, value=adress_model)