from __future__ import annotations
from constants.clientConstants import DOCUMENT_TYPE, ADRESS_TYPE, TYPE_PEOPLEPLACE_CHOICES
from django.db import models

class Client(models.Model):
    name = models.CharField(
        max_length=255,
        null=False,
        blank=False
    )
    code = models.CharField(
        max_length=10, 
        unique=True,
        null=False,
        blank=False
    )
    doc_type = models.CharField(
        max_length=4,
        null=True,
        blank=True,
        choices=DOCUMENT_TYPE
    )
    doc = models.CharField(
        max_length=14,
        unique=True, 
        null=True, 
        blank=True
    )
    contact = models.CharField(
        max_length=11,
        unique=True,
        null=False, 
        blank=False
    )
    email = models.EmailField(
        max_length=255, 
        unique=True,
        null=False, 
        blank=False
    )
    state_register = models.CharField(
        max_length=14, 
        null=False, 
        blank=False
    )
    
    def clientSave(self, client: Client):
        if client: 
            client.save()
            return client
        return None 
    
    def contactAlreadyRegistered(self, contact: str):
        return Client.objects.filter(contact=contact).exists()
    
    def emailtAlreadyRegistered(self, email: str):
        return Client.objects.filter(email=email).exists()
    
    def clientHasAdress(self, code_client: str):
        client = Client.objects.filter(code=code_client).first()
        adress = Adress.objects.filter(client=client).first()
        if adress:
            return True
        return False

    def clientExists(self, code_client: str='', doc: str='') -> bool:
        if code_client and doc:
            return Client.objects.filter(code=code_client ,doc=doc).exists()
        elif doc:
            return Client.objects.filter(doc=doc).exists()
        elif code_client:
            return Client.objects.filter(code=code_client).exists()
        return False

    def clientReturn(self, doc: str='', code_client: str='', name: str=''):
        if name:
            list_client = Client.objects.filter(name=name)
            if not list_client:
                return None
            return list(list_client)
        elif doc:
            client = Client.objects.filter(doc=doc).first()
        elif code_client:
            client = Client.objects.filter(code=code_client).first()
        if not client:
            return None
        return client

    def clientDelete(self, doc: str='', code_client: str=''):
        if doc:
            Client.objects.filter(doc=doc).delete()
        elif code_client:
            Client.objects.filter(code=code_client).delete()
        return None
        
    def clientList(self) -> list:
        return list(Client.objects.all())
    
    def clientModify(self, client: Client, code_client: str):
        if not client or not code_client:
            return None
        client_obj = Client.objects.filter(code=code_client).first()
        if not client_obj:
            return None
        client_obj.code = client.code
        client_obj.name = client.name
        client_obj.doc_type = client.doc_type
        client_obj.doc = client.doc
        client_obj.state_register = client.state_register
        client_obj.save()
        return client_obj
             
    
class Adress(models.Model):
    client = models.ForeignKey("Client.Client", verbose_name="client", on_delete=models.CASCADE)
    code_zone = models.CharField(
        max_length=8,
        null=False,
        blank=False
    )
    city = models.CharField(
        max_length=255,
        null=False,
        blank=False
    )
    people_place = models.CharField(
        max_length=255,
        null=False,
        blank=False,
        choices=TYPE_PEOPLEPLACE_CHOICES
    )
    neig_b = models.CharField(
        max_length=255,
        null=False,
        blank=False
    )
    number = models.CharField(
        max_length=8,
        null=False,
        blank=False
    )
    type = models.CharField(
        max_length=15,
        null=True,
        blank=True,
        choices=ADRESS_TYPE
    )
    
    def adressSave(self, adress: Adress, code_client: str):
        if adress:
            client = Client.objects.filter(code=code_client).first()
            adress.client = client
            adress.save()
            return adress
        return None   
    
    def adressExists(self, adress: Adress) -> bool:
        return Adress.objects.filter(city=adress.city, neig_b=adress.neig_b, number=adress.number).exists()
    
    def adressReturn(self, code_client: str) -> Adress:
        if code_client:
            client = Client.objects.filter(code=code_client).first()
            adress = Adress.objects.filter(client=client).first()
            return adress
        return None
    
    def adressModify(self, adress: Adress, code_client: str='') -> Adress:
        if not adress or not code_client:
            return None
        client = Client.objects.filter(code=code_client).first()
        adress_obj = Adress.objects.filter(client=client).first()
        if not client or not adress_obj:
            return None
        adress.client = client
        adress_obj.code_zone = adress.code_zone
        adress_obj.city = adress.city
        adress_obj.people_place = adress.people_place
        adress_obj.neig_b = adress.neig_b
        adress_obj.number = adress.number
        adress_obj.type = adress.type
        adress_obj.save()
        return adress_obj
    
    def adressDelete(self, code_client: str=''):
        if not code_client:
            return None
        client = Client.objects.filter(code=code_client).first()
        adress = Adress.objects.filter(client=client).first()
        if not adress:
            return None
        adress.delete()