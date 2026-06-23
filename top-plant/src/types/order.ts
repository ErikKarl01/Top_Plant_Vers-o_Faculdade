export type OrderItemDTO = {
  product_name: string
  product_code: string
  amount: number
  price: number
  discount: number
}

export type OrderDTO = {
  code: string
  date: string
  client_code: string
  client_name: string
  status: string
}

export type OrderListItem = {
  order?: Partial<OrderDTO>
  order_items?: OrderItemDTO[]
}

export type OrderSearchFilters = {
  code_order?: string
  code_client?: string
  status?: string
  start?: string
  end?: string
}

export type OrderSavePayload = {
  code_client: string
  codes_product: string[]
}
