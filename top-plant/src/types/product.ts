export type ProductDTO = {
  code: string
  name: string
  description: string
  type: string
  measure: string
  price?: number
}

export type ProductListItem = {
  produto?: Partial<ProductDTO>
  product?: Partial<ProductDTO>
  code?: string
  codigo?: string
  name?: string
  nome?: string
  description?: string
  descricao?: string
  type?: string
  tipo?: string
  measure?: string
  medida?: string
  price?: number
  preco?: number
}
