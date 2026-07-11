from Client.dto import ClientDTO, AdressDTO
from utils.toClean import ToClean
from Client.service.clientService import ClientService
from Client.service.adressService import AdressService
from utils.converet.convertClient import ConvertClient, ConvertAdress
from constants.responseClass import Response
from constants.clientConstants import Errors

def cleanClient(clientDTO: ClientDTO):
    clean = ToClean()
    client_clean = ClientDTO()
    client_clean.code = clean.alphaNumeric(clientDTO.code)
    client_clean.doc = clean.onlyDigits(clientDTO.doc)
    client_clean.name = clean.name(clientDTO.name)
    client_clean.contact = clean.onlyDigits(clientDTO.contact)
    client_clean.email = clean.email(clientDTO.email)
    client_clean.doc_type = clean.enums(clientDTO.doc_type)
    client_clean.state_register = clean.onlyDigits(clientDTO.state_register)
    return client_clean

def cleanAdress(adressDTO: AdressDTO):
    clean = ToClean()
    adress_clean = AdressDTO()
    adress_clean.code_zone = clean.onlyDigits(adressDTO.code_zone)
    adress_clean.city = clean.text(adressDTO.city)
    adress_clean.neig_b = clean.text(adressDTO.neig_b)
    adress_clean.number = clean.onlyDigits(adressDTO.number)
    adress_clean.people_place = clean.enums(adressDTO.people_place)
    adress_clean.type = clean.enums(adressDTO.type)
    return adress_clean


class ServiceCentralized:
    c_service = ClientService()
    a_service = AdressService()
    convert_client = ConvertClient()
    convert_adress = ConvertAdress()
    response = Response()
    errors = Errors()
    
    def saveClientResponse(self, clientDTO: ClientDTO):
        client_clean = cleanClient(clientDTO=clientDTO)
        response_client = self.c_service.clientSave(clientDTO=client_clean)
        
        if not response_client.sucess:
            return response_client.toDict()
                
        client_model = response_client.value
        
        try:
            client_dict = self.convert_client.toDict(client=client_model)
        except Exception:
            response_ = self.response.erroMens(menssage=self.errors.CONVERSION_ERROR, status=500)
            return response_
        
        response_client.value = client_dict
        response_ = response_client.toDict()
        return response_  
    
    
    def saveAdressResponse(self, adressDTO: AdressDTO, code_client: str):
        response_client = self.c_service.clientReturn(code_client=code_client)
        
        if not response_client.sucess:
            return response_client.toDict()
        
        client = response_client.value
        adress_clean = cleanAdress(adressDTO=adressDTO)
        response_adress = self.a_service.adressSave(adressDTO=adress_clean, code_client=client.code)
        
        if not response_adress.sucess:
            return response_adress.toDict()
        
        adress_model = response_adress.value
        
        try:
            adress_dict = self.convert_adress.toDict(adress=adress_model)
        except Exception:
            response_ = self.response.erroMens(menssage=self.errors.CONVERSION_ERROR, status=500)
            return response_
        
        response_client.value = adress_dict
        response_ = response_client.toDict()
        return response_
    
    
    def returnIntanceResponse(self, code_client: str='', doc: str='', name: str=''):
        response_client = self.c_service.clientReturn(code_client=code_client, doc=doc, name=name)

        if not response_client.sucess:
            return response_client.toDict()

        client_model = response_client.value

        if not isinstance(client_model, list):
            response_adress = self.a_service.adressReturn(code_client=client_model.code)
    
            try:
                client_dict = self.convert_client.toDict(client=client_model)
                
                if response_adress.sucess and response_adress.value is not None:
                    adress_dict = self.convert_adress.toDict(adress=response_adress.value)
                else:
                    adress_dict = None
                    
            except Exception:
                return Response().erroMens(Errors.CONVERSION_ERROR, 500).toDict()
                
            response_client.value = {'client': client_dict, 'adress': adress_dict}
            return response_client.toDict()


        list_dicts = []
        for client in client_model:
            response_adress = self.a_service.adressReturn(code_client=client.code)

            try:
                client_dict = self.convert_client.toDict(client=client)
                
                if response_adress.sucess and response_adress.value is not None:
                    adress_dict = self.convert_adress.toDict(adress=response_adress.value)
                else:
                    adress_dict = None
                    
            except Exception:
                return Response().erroMens(Errors.CONVERSION_ERROR, 500).toDict()
                
            list_dicts.append({'client': client_dict, 'adress': adress_dict})

        response_client.value = list_dicts

        return response_client.toDict()


    def listInstancesResponse(self):
        response_clients = self.c_service.clientList()
        if not response_clients.sucess:
            return response_clients.toDict()
        
        clients = response_clients.value
        mensage = response_clients.menssage
        
        list_return = []

        for client in clients:
            response_adress = self.a_service.adressReturn(code_client=client.code)

            try:
                client_dict = self.convert_client.toDict(client=client)
                
                if response_adress.sucess and response_adress.value is not None:
                    adress_dict = self.convert_adress.toDict(adress=response_adress.value)
                else:
                    adress_dict = None 
                    
            except Exception:
                return Response().erroMens(Errors.CONVERSION_ERROR, 500).toDict()

            list_return.append({'client': client_dict, 'adress': adress_dict})

        return Response().sucessMens(mensage, list_return).toDict()

    def modifyResponse(self, code_client: str, clientDTO: ClientDTO, adressDTO: AdressDTO):
        client_clean = cleanClient(clientDTO)
        
        # 1. Modifica o cliente PRIMEIRO (isso sempre tem que acontecer)
        response_client = self.c_service.clientModify(client_clean, code_client)

        if not response_client.sucess:
            return response_client.toDict()
        
        client_model = response_client.value
        adress_dict = None # Inicia vazio por padrão
        
        # 2. Verifica se o cliente tem endereço para atualizar
        has_adress = self.c_service.c_model.clientHasAdress(code_client=clientDTO.code)
        
        if has_adress:
            adress_clean = cleanAdress(adressDTO)
            response_adress = self.a_service.adressModify(client_model.code, adress_clean)

            if not response_adress.sucess:
                # Se falhou no endereço, retorna o erro do endereço
                return response_adress.toDict()
            
            # Converte o endereço com sucesso
            try:
                adress_dict = self.convert_adress.toDict(adress=response_adress.value)
            except Exception:
                # Se der erro aqui, é erro de conversão
                return self.response.erroMens("Erro de conversão", 500).toDict()

        # 3. Converte o cliente
        try:
            client_dict = self.convert_client.toDict(client=client_model)
        except Exception:
            return self.response.erroMens("Erro de conversão", 500).toDict()

        # 4. Junta tudo. Se não tinha endereço, adress_dict vai como None e não quebra nada!
        response_client.value = {'client': client_dict, 'adress': adress_dict}
        return response_client.toDict()


    def deleteResponse(self, code_client: str):
        response_adress = self.a_service.adressDelete(code_client)

        if not response_adress.sucess:
            return response_adress.toDict()

        response_client = self.c_service.clientDelete(code_client)

        if not response_client.sucess:
            return response_client.toDict()

        return response_client.toDict()