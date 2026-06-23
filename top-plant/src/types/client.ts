export type ClientDTO = {
  code: string
  name: string
  doc_type: string
  doc: string
  contact: string
  email: string
  state_register: string
}

export type AdressDTO = {
  code_zone: string
  city: string
  people_place: string
  neig_b: string
  number: string
  type: string
}

export type ClientListItem = {
  client?: Partial<ClientDTO>
  cliente?: Partial<ClientDTO>
  code?: string
  codigo?: string
  name?: string
  nome?: string
}

export type ClientLookupItem = {
  client?: Partial<ClientDTO>
  adress?: Partial<AdressDTO> | null
}