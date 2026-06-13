from Client.models import Client, Adress
from Client.dto import ClientDTO, AdressDTO


class ConvertClient:

    def toDTO(self, client: Client) -> ClientDTO:
        return ClientDTO(
            name=client.name,
            code=client.code,
            doc_type=client.doc_type,
            doc=client.doc,
            contact=client.contact,
            email=client.email,
            state_register=client.state_register
        )

    def toDict(self, client: Client) -> dict:
        return {
            'name': client.name,
            'code': client.code,
            'doc_type': client.doc_type,
            'doc': client.doc,
            'contact': client.contact,
            'email': client.email,
            'state_register': client.state_register
        }

    def toModel(self, dto: ClientDTO) -> Client:
        return Client(
            name=dto.name,
            code=dto.code,
            doc_type=dto.doc_type,
            doc=dto.doc,
            contact=dto.contact,
            email=dto.email,
            state_register=dto.state_register
        )


class ConvertAdress:

    def toDTO(self, adress: Adress) -> AdressDTO:
        return AdressDTO(
            code_zone=adress.code_zone,
            city=adress.city,
            people_place=adress.people_place,
            neig_b=adress.neig_b,
            number=adress.number,
            type=adress.type
        )

    def toDict(self, adress: Adress) -> dict:
        return {
            'code_zone': adress.code_zone,
            'city': adress.city,
            'people_place': adress.people_place,
            'neig_b': adress.neig_b,
            'number': adress.number,
            'type': adress.type
        }

    def toModel(self, dto: AdressDTO) -> Adress:
        return Adress(
            client=None,
            code_zone=dto.code_zone,
            city=dto.city,
            people_place=dto.people_place,
            neig_b=dto.neig_b,
            number=dto.number,
            type=dto.type
        )