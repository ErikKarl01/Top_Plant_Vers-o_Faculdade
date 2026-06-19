from utils.converet.convertClient import ConvertClient
from Client.dto import ClientDTO
from utils.validate import Validate, MENSAGE_SUCESS
from Client.models import Client
from sistem.TPV2.constants.clientConstants import Errors, Success
from constants.responseClass import Response

def verifyUniqueCamps(email: str, contact: str):
    c_model = Client()
    mensages = []
    if c_model.emailtAlreadyRegistered(email=email):
        mensages.append(Errors.EMAIL_ALREADY_REGISTES)
    if c_model.contactAlreadyRegistered(contact=contact):
        mensages.append(Errors.CONTACT_ALREADY_REGISTES)
    return mensages
    
    

class ClientService:
    validate = Validate()
    convert_client = ConvertClient()
    c_model = Client()


    def clientSave(self, clientDTO: ClientDTO) -> Response:
        mens_client = self.validate.Client().forRegister(client=clientDTO)
        if mens_client != MENSAGE_SUCESS:
            return Response().erroMens(menssage=mens_client, status=400)
        if self.c_model.clientExists(code_client=clientDTO.code, doc=clientDTO.doc):
            return Response().erroMens(menssage=Errors.CLIENT_ALREADY_EXISTS, status=409)
        mensages = verifyUniqueCamps(contact=clientDTO.contact, email=clientDTO.email)
        if mensages:
            return Response().erroMens(menssage=mensages, status=409)
        try:
            client_model = self.convert_client.toModel(dto=clientDTO)
        except Exception:
            return Response().erroMens(menssage=Errors.CONVERSION_ERROR, status=500)
        try:
            self.c_model.clientSave(client=client_model)
        except Exception as e:
            return Response().erroMens(menssage=Errors.MODELS_ERROR, status=500)
        return Response().sucessMens(mensage=Success.CLIENT_MODIFIED, value=client_model)

        
    def clientModify(self, clientDTO, code_client: str) -> Response:
        validate_client = self.validate.Client()
        result_validate = validate_client.forRegister(clientDTO)
        if result_validate != MENSAGE_SUCESS:
            return Response().erroMens(menssage=result_validate, status=400)
        if not self.c_model.clientExists(code_client=code_client):
            return Response().erroMens(Errors.CLIENT_NOT_FOUND, 404)
        mensages = verifyUniqueCamps(contact=clientDTO.contact, email=clientDTO.email)
        if mensages:
            return Response().erroMens(menssage=mensages, status=409)
        try:
            client_model = self.convert_client.toModel(clientDTO)
        except Exception:
            return Response().erroMens(menssage=Errors.CONVERSION_ERROR, status=500)
        try:
            self.c_model.clientModify(client=client_model, code_client=code_client)
        except Exception:
            return Response().erroMens(menssage=Errors.MODELS_ERROR, status=500)
        return Response().sucessMens(mensage=Success.CLIENT_MODIFIED, value=client_model)
    
    
    def clientDelete(self, code_client: str) -> Response:
        validate_mens = self.validate.validateCode(code_client)
        if validate_mens != MENSAGE_SUCESS:
            return Response().erroMens(menssage=validate_mens, status=409)
        if not self.c_model.clientExists(code_client=code_client):
            return Response().erroMens(mensage=Errors.CLIENT_NOT_FOUND, status=404)
        try:
            self.c_model.clientDelete(code_client=code_client)
        except Exception:
            return Response().erroMens(menssage=Errors.MODELS_ERROR, status=500)
        return Response().sucessMens(mensage=Success.CLIENT_DELETED, value=None)
    
    
    def clientReturn(self, code_client: str='', doc: str='', name: str='') -> Response:
        validate_client = self.validate.Client()
        if self.validate.validateCode(code_client) == MENSAGE_SUCESS:
            return self.clientReturnByCode(code_client)
        if validate_client.cpf(doc) == MENSAGE_SUCESS or validate_client.cnpj(doc) == MENSAGE_SUCESS:
            return self.clientReturnByDoc(doc)
        if validate_client.validateName(name) == MENSAGE_SUCESS:
            return self.clientReturnByName(name)
        return Response().erroMens(menssage=Errors.SEARCH_ERROR, status=409)


    def clientReturnByCode(self, code_client: str) -> Response:
        model_return = self.c_model.clientReturn(code_client=code_client)
        if not model_return:
            return Response().erroMens(menssage=Errors.CLIENT_NOT_FOUND, status=404)
        return Response().sucessMens(mensage=Success.RETURN, value=model_return)
                
                
    def clientReturnByDoc(self, doc: str) -> Response:
        model_return = self.c_model.clientReturn(doc=doc)
        if not model_return:
            return Response().erroMens(menssage=Errors.CLIENT_NOT_FOUND, status=404)
        return Response().sucessMens(mensage=Success.RETURN, value=model_return)
    
    
    def clientReturnByName(self, name: str) -> Response:
        model_return = self.c_model.clientReturn(name=name)
        if not model_return:
            return Response().erroMens(menssage=Errors.CLIENT_NOT_FOUND, status=404)
        clients_return = []
        for client in model_return:
            clients_return.append(client)
        return Response().sucessMens(mensage=Success.RETURN, value=clients_return)
        
    
    def clientList(self) -> Response:
        client_list = self.c_model.clientList()
        if not client_list:
            return Response().erroMens(menssage=Errors.NULL_LIST, status=404)
        return Response().sucessMens(mensage=Success.RETURN, value=client_list)