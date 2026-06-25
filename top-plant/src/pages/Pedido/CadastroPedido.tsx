import { useMemo, useState, type FormEvent } from 'react'
import type { ApiResponse } from '../../App'
import { MensagemRetorno } from '../../components/layout/MensagemRetorno'
import type { ClientLookupItem } from '../../types/client'
import type { OrderSavePayload } from '../../types/order'
import type { ProductListItem } from '../../types/product'

type CadastroPedidoProps = {
  clientList: ClientLookupItem[]
  productList: ProductListItem[]
  handleSalvarPedido: (payload: OrderSavePayload) => Promise<ApiResponse | void> | void
  busy: string | null
  response: ApiResponse | null
}

type ClientView = {
  code: string
  name: string
  doc: string
}

type ProductView = {
  code: string
  name: string
  type: string
}

function normalizeClient(item: ClientLookupItem | Record<string, unknown>): ClientView {
  const clientData = (item as ClientLookupItem).client || (item as ClientLookupItem).client || item
  const client = clientData as Record<string, unknown>

  return {
    code: String(client.code ?? client.codigo ?? '').trim(),
    name: String(client.name ?? client.nome ?? 'Sem nome').trim(),
    doc: String(client.doc ?? client.cnpj ?? '').trim(),
  }
}

function normalizeProduct(item: ProductListItem | Record<string, unknown>): ProductView {
  const productData = (item as ProductListItem).produto || (item as ProductListItem).product || item
  const product = productData as Record<string, unknown>

  return {
    code: String(product.code ?? product.codigo ?? '').trim(),
    name: String(product.name ?? product.nome ?? 'Sem nome').trim(),
    type: String(product.type ?? product.tipo ?? '').trim(),
  }
}

export function CadastroPedido({ clientList, productList, handleSalvarPedido, busy, response }: CadastroPedidoProps) {
  const [clientSearch, setClientSearch] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [selectedClientCode, setSelectedClientCode] = useState('')
  const [selectedProductCodes, setSelectedProductCodes] = useState<string[]>([])

  const clients = useMemo(() => clientList.map(normalizeClient).filter(client => client.code), [clientList])
  const products = useMemo(() => productList.map(normalizeProduct).filter(product => product.code), [productList])

  const filteredClients = useMemo(() => {
    const query = clientSearch.trim().toLowerCase()
    if (!query) return clients

    return clients.filter(client => {
      const searchable = `${client.code} ${client.name} ${client.doc}`.toLowerCase()
      return searchable.includes(query)
    })
  }, [clients, clientSearch])

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase()
    if (!query) return products

    return products.filter(product => {
      const searchable = `${product.code} ${product.name} ${product.type}`.toLowerCase()
      return searchable.includes(query)
    })
  }, [products, productSearch])

  const selectedClient = clients.find(client => client.code === selectedClientCode) ?? null
  const selectedProducts = products.filter(product => selectedProductCodes.includes(product.code))

  const toggleProduct = (code: string) => {
    setSelectedProductCodes(current => (
      current.includes(code)
        ? current.filter(item => item !== code)
        : [...current, code]
    ))
  }

  const clearSelection = () => {
    setSelectedClientCode('')
    setSelectedProductCodes([])
    setClientSearch('')
    setProductSearch('')
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!selectedClientCode) {
      alert('Selecione um cliente para registrar o pedido.')
      return
    }

    if (selectedProductCodes.length === 0) {
      alert('Selecione pelo menos um produto.')
      return
    }

    const payload: OrderSavePayload = {
      code_client: selectedClientCode,
      codes_product: selectedProductCodes,
      items: [],
    }

    const result = await handleSalvarPedido(payload)
    if (result === undefined || result.sucess) {
      clearSelection()
    }
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 flex flex-col gap-6">
        <MensagemRetorno response={response} />

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="mb-4 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-semibold text-gray-800">Novo Pedido</h2>
              <p className="text-gray-500 text-sm mt-1">Escolha um cliente e selecione os produtos que entram no pedido.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">Buscar cliente</label>
                <input
                  type="text"
                  value={clientSearch}
                  onChange={event => setClientSearch(event.target.value)}
                  placeholder="Código, nome ou documento"
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-gray-700"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">Buscar produto</label>
                <input
                  type="text"
                  value={productSearch}
                  onChange={event => setProductSearch(event.target.value)}
                  placeholder="Código, nome ou tipo"
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-gray-700"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Selecionar Cliente</h3>
            <div className="border border-gray-100 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="text-gray-500 text-sm border-b border-gray-100">
                    <th className="p-3 font-medium">Código</th>
                    <th className="p-3 font-medium">Nome</th>
                    <th className="p-3 font-medium">Documento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredClients.length > 0 ? (
                    filteredClients.map(client => {
                      const isSelected = selectedClientCode === client.code

                      return (
                        <tr
                          key={client.code}
                          onClick={() => setSelectedClientCode(client.code)}
                          className={`cursor-pointer transition-colors ${isSelected ? 'bg-green-100' : 'hover:bg-green-50'}`}
                        >
                          <td className="p-3 text-gray-800 font-medium">{client.code}</td>
                          <td className="p-3 text-gray-600">{client.name}</td>
                          <td className="p-3 text-gray-600">{client.doc || '-'}</td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-6 text-center text-gray-400">Nenhum cliente encontrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Selecionar Produtos</h3>
            <div className="border border-gray-100 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                  <tr className="text-gray-500 text-sm border-b border-gray-100">
                    <th className="p-3 font-medium w-12 text-center">Sel.</th>
                    <th className="p-3 font-medium">Código</th>
                    <th className="p-3 font-medium">Nome</th>
                    <th className="p-3 font-medium">Tipo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => {
                      const checked = selectedProductCodes.includes(product.code)

                      return (
                        <tr key={product.code} className="hover:bg-gray-50 transition-colors">
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleProduct(product.code)}
                              className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 cursor-pointer accent-green-600"
                            />
                          </td>
                          <td className="p-3 text-gray-800 font-medium">{product.code}</td>
                          <td className="p-3 text-gray-600">{product.name}</td>
                          <td className="p-3 text-gray-600">{product.type || '-'}</td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-gray-400">Nenhum produto encontrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              disabled={busy === 'pedido-save'}
              className="flex-1 px-8 py-3 bg-[#4BAF47] hover:bg-[#3D943A] text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-70"
            >
              {busy === 'pedido-save' ? 'Processando...' : 'Finalizar Pedido'}
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium rounded-xl transition-colors"
            >
              Limpar
            </button>
          </div>
        </form>
      </div>

      <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit sticky top-6 flex flex-col gap-5">
        <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-100 pb-4">Resumo do Pedido</h2>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
          <p className="text-sm font-medium text-gray-500">Cliente selecionado</p>
          <p className="text-gray-800 font-semibold">
            {selectedClient ? `${selectedClient.name} (${selectedClient.code})` : 'Nenhum cliente selecionado'}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider">Produtos escolhidos</h3>
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {selectedProducts.length > 0 ? (
              selectedProducts.map(product => (
                <div key={product.code} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="font-medium text-gray-800 text-sm">{product.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{product.code}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 text-sm py-8">Selecione produtos na lista ao lado.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-500">
          O backend cria o pedido com os códigos selecionados e gera os itens automaticamente.
        </div>
      </div>
    </div>
  )
}
