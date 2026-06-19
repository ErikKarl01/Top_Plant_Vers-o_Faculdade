from Product.models import Product
from Product.dto import ProductDTO

class ConvertProduct:
    
    def toDict(self, product: Product) -> dict:
        return {
            "code": product.code,
            "name": product.name,
            "price": product.price,
            "description": product.description,
            "type": product.type,
            "measure": product.measure,
            "licensed": product.licensed
        }
    
    def toModel(self, product: ProductDTO) -> Product:
        return Product (
            code=product.code,
            name=product.name,
            price=product.price,
            description=product.description,
            type=product.type,
            measure=product.measure,
            licensed=product.licensed
        )
    
    def toDTO(self, product: Product) -> ProductDTO:
        return ProductDTO (
            code=product.code,
            name=product.name,
            price=product.price,
            description=product.description,
            type=product.type,
            measure=product.measure,
            licensed=product.licensed
        )