import { useEffect, useState, type FormEvent } from 'react'
import './App.css'
import { Navbar, type Section } from './components/layout/Navbar'
import { Home } from './pages/Core/Home'
import { CadastroCliente } from './pages/Cliente/CadastroCliente'
import { ConsultaCliente } from './pages/Cliente/ConsultaCliente'
import { ExclusaoCliente } from './pages/Cliente/ExclusaoCliente'
import { CadastroProduto } from './pages/Produto/CadastroProduto'
import { ConsultaProduto } from './pages/Produto/ConsultaProduto'
import { EditarExcluirProduto } from './pages/Produto/EditarExcluirProduto'
import { CadastroPedido } from './pages/Pedido/CadastroPedido'
import { ConsultaPedido } from './pages/Pedido/ConsultaPedido'
import { type AdressDTO, type ClientDTO, type ClientLookupItem } from './types/client'
import { type ProductListItem } from './types/product'
import { type OrderListItem, type OrderSavePayload, type OrderSearchFilters } from './types/order'

export type ApiResponse = {
  status?: number
  mensage?: string | string[]
  sucess?: boolean
  value?: unknown
}

// const apiBase = '/api'

const defaultClient: ClientDTO = {
  code: '',
  name: '',
  doc_type: 'CPF',
  doc: '',
  contact: '',
  email: '',
  state_register: '',
}

const defaultAddress: AdressDTO = {
  code_zone: '',
  city: '',
  people_place: 'RUA',
  neig_b: '',
  number: '',
  type: 'COMERCIAL',
}

async function requestJson(path: string, method: 'GET' | 'POST', body?: unknown) {
  const response = await fetch(`${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await response.text()

  try {
    return JSON.parse(text) as ApiResponse
  } catch {
    return {
      status: response.status,
      sucess: response.ok,
      mensage: text,
    }
  }
}

function App() {
  const [section, setSection] = useState<Section>('inicio')
  const [clientForm, setClientForm] = useState(defaultClient)
  const [addressForm, setAddressForm] = useState(defaultAddress)
  const [clientList, setClientList] = useState<ClientLookupItem[]>([])
  const [clientSearchList, setClientSearchList] = useState<ClientLookupItem[]>([])
  const [productList, setProductList] = useState<ProductListItem[]>([])
  const [orderList, setOrderList] = useState<OrderListItem[]>([])
  const [clientSearch, setClientSearch] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    void loadLists()
  }, [])

  useEffect(() => {
    if (section === 'pedido-consulta') {
      void loadOrders()
    }
  }, [section])

  async function loadLists() {
    try {

      const [clients, products] = await Promise.all([
        requestJson('/client/list/', 'GET'),
        requestJson('/product/list/', 'GET'),
      ])
      console.log("🔍 [DEBUG] Retorno da Rota de Clientes:", clients)
      console.log("🔍 [DEBUG] A lista de clientes real:", clients.value)

      
      console.log("🔍 [DEBUG] Retorno da Rota de Produtos:", products)
      console.log("🔍 [DEBUG] A lista de produtos real:", products.value)

      if (clients.sucess && Array.isArray(clients.value)) setClientList(clients.value as ClientLookupItem[])
      if (products.sucess && Array.isArray(products.value)) setProductList(products.value as ProductListItem[])
    } catch {
      setClientList([])
      setProductList([])
    }
  }

  async function loadOrders() {
    try {
      const result = await requestJson('/order/return/', 'POST', {})
      if (result.sucess && Array.isArray(result.value)) {
        setOrderList(result.value as OrderListItem[])
        return
      }
      setOrderList([])
    } catch {
      setOrderList([])
    }
  }

  async function handleClientSave(event: FormEvent) {
    event.preventDefault()
    setBusy('client-save')
    const result = await requestJson('/client/save-client/', 'POST', { client: clientForm })
    setResponse(result)
    setBusy(null)
    await loadLists()
  }

  async function handleAddressSave(event: FormEvent) {
    event.preventDefault()
    setBusy('address-save')
    const result = await requestJson('/client/save-adress/', 'POST', {
      code_client: clientForm.code,
      adress: addressForm,
    })
    setResponse(result)
    setBusy(null)
  }

  async function handleOrderSave(payload: OrderSavePayload) {
    setBusy('pedido-save')
    const result = await requestJson('/order/create/', 'POST', payload)
    setResponse(result)
    setBusy(null)
    await loadOrders()
    return result
  }

  async function handleOrderSearch(filters: OrderSearchFilters) {
    setBusy('pedido-search')

    const codeOrder = filters.code_order?.trim()
    const codeClient = filters.code_client?.trim() || ''
    const status = filters.status?.trim() || ''

    const hasDateRange = Boolean(filters.start?.trim() && filters.end?.trim())

    const result = codeOrder
      ? await requestJson('/order/get/', 'POST', { code_order: codeOrder })
      : await requestJson('/order/return/', 'POST', {
          time_interval: hasDateRange ? { start: filters.start, end: filters.end } : {},
          status,
          code_client: codeClient,
        })

    setResponse(result)

    if (result.sucess && result.value) {
      const orderLookup = Array.isArray(result.value) ? result.value : [result.value]
      setOrderList(orderLookup as OrderListItem[])
    } else {
      setOrderList([])
    }

    setBusy(null)
    return result
  }

  async function handleOrderUpdate(codeOrder: string) {
    setBusy('pedido-update')
    const result = await requestJson('/order/update/', 'POST', { code_order: codeOrder })
    setResponse(result)
    setBusy(null)
    await loadOrders()
    return result
  }

  async function handleOrderDelete(codeOrder: string) {
    setBusy('pedido-delete')
    const result = await requestJson('/order/delete/', 'POST', { code_order: codeOrder })
    setResponse(result)
    setBusy(null)
    await loadOrders()
    return result
  }

  async function handleClientSearch(event: FormEvent) {
    event.preventDefault()
    setBusy('client-search')

    if (!clientSearch.trim()) {
      setClientSearchList([])
      setResponse(null)
      setBusy(null)
      return
    }

    const result = await requestJson('/client/search/', 'POST', {
      code_client: clientSearch,
    })
    setResponse(result)
    if (result.sucess && result.value) {
      const clientLookup = Array.isArray(result.value) ? result.value : [result.value]
      setClientSearchList(clientLookup as ClientLookupItem[])
    } else {
      setClientSearchList([])
    }
    setBusy(null)
  }

  async function handleClientDelete(doc: string) {
    setBusy('client-delete')

    const lookup = await requestJson('/client/search/', 'POST', { doc })
    if (!lookup.sucess || !lookup.value) {
      setResponse(lookup)
      setBusy(null)
      return lookup
    }

    const clientValue = lookup.value as { client?: { code?: string } }
    const codeClient = clientValue.client?.code

    if (!codeClient) {
      setResponse({ sucess: false, mensage: 'Nao foi possivel obter o codigo do cliente.' })
      setBusy(null)
      return
    }

    const result = await requestJson('/client/delete/', 'POST', { code_client: codeClient })
    setResponse(result)
    setBusy(null)
    await loadLists()
    return result
  }

  async function handleProductSave(payloadRecebido: any) {
    setBusy('product-save')

    // Pega os dados brutos que vieram do formulário
    const p = payloadRecebido.produto || payloadRecebido;

    // Traduz para o inglês enviando os campos do ProductDTO
    const result = await requestJson('/product/save/', 'POST', {
      product: {
        code: p.codigo || '',
        name: p.nome || '',
        description: p.descricao || '',
        type: (p.tipo || '').toUpperCase().trim(),
        measure: (p.medida || '').toUpperCase().trim(),
        price: Number(p.preco || 0) // <-- ADICIONADO AQUI!
      },
    })
    
    setResponse(result)
    setBusy(null)
    await loadLists()
  }

async function handleProductSearch(event: FormEvent) {
    event.preventDefault()
    setBusy('product-search')

    // 1. Se o usuário clicar em buscar com a barra vazia, recarrega a lista toda
    if (!productSearch.trim()) {
      await loadLists()
      setResponse(null)
      setBusy(null)
      return
    }

    // Faz a busca no backend
    const result = await requestJson('/product/return/', 'POST', {
      code_product: productSearch,
    })
    
    setResponse(result)

    // 2. Lógica para atualizar a tabela na tela
    if (result.sucess && result.value) {
      // Se achou, substitui a lista toda por apenas este produto.
      // (O React exige um Array. Se o backend mandou um objeto solto, transformamos em array).
      const produtoEncontrado = Array.isArray(result.value) ? result.value : [result.value]
      setProductList(produtoEncontrado)
    } else {
      // Se deu erro (produto não existe), deixa a tabela vazia!
      setProductList([])
    }

    setBusy(null)
  }

return (
    <div className="app-shell min-h-screen flex flex-col font-sans">
      {/* Navbar global controlando as rotas */}
      <Navbar setSection={setSection} />

      <main className="app-main flex-1 w-full px-4 py-6 md:px-8 md:py-10">
        
        {/* === CORE === */}
        {section === 'inicio' && <Home setSection={setSection} />}

        {/* === CLIENTES === */}
        {section === 'cliente' && (
          <CadastroCliente 
            clientForm={clientForm} setClientForm={setClientForm}
            addressForm={addressForm} setAddressForm={setAddressForm}
            handleClientSave={handleClientSave} handleAddressSave={handleAddressSave}
            busy={busy}
            response={response} 
            clientList={clientList}
          />
        )}
        {section === 'cliente-consulta' && (
          <ConsultaCliente 
            clientSearch={clientSearch} setClientSearch={setClientSearch}
            handleClientSearch={handleClientSearch} clientList={clientSearch.trim() ? clientSearchList : clientList} busy={busy}
            response={response}
          />
        )}
        {section === 'cliente-excluir' && (
          <ExclusaoCliente 
            handleDeleteClient={handleClientDelete}
            busy={busy}
            response={response} // <-- Adicionado
          />
        )}

        {/* === PRODUTOS === */}
        {section === 'produto' && (
          <CadastroProduto 
            handleCadastrar={handleProductSave} 
            busy={busy} 
            response={response} // <-- Adicionado
          />
        )}
        {section === 'produto-consulta' && (
          <ConsultaProduto 
            productList={productList} 
            productSearch={productSearch}
            setProductSearch={setProductSearch}
            handleBuscar={handleProductSearch} 
            handleLimpar={() => loadLists()} 
            busy={busy} 
            response={response}
          />
        )}
        {section === 'produto-editar' && (
          <EditarExcluirProduto 
            handleBuscarParaEdicao={async (codigo, nome) => {
              setBusy('produto-buscar')
              
              // 1. Faz a busca no backend usando a mesma rota da consulta
              const result = await requestJson('/product/return/', 'POST', {
                code_product: codigo,
                name: nome
              })
              
              // Atualiza a caixinha na hora (apagando a mensagem fantasma)
              setResponse(result)
              setBusy(null)

              // 2. Se achou, mapeia do inglês (banco) pro português (tela)
              if (result.sucess && result.value) {
                const p = Array.isArray(result.value) ? result.value[0] : result.value
                const prod = p.produto || p

                return {
                  codigo: prod.code || prod.codigo || '',
                  nome: prod.name || prod.nome || '',
                  descricao: prod.description || prod.descricao || '',
                  tipo: prod.type || prod.tipo || '',
                  medida: prod.measure || prod.medida || ''
                }
              }

              // Se não achou ou deu erro, retorna nulo para o formulário não abrir
              return null
            }}
            handleAtualizar={async (payload) => {
              setBusy('produto-atualizar')
              
              const result = await requestJson('/product/update/', 'POST', {
                code_product: payload.codigo,
                product: {
                  code: payload.produto.codigo,
                  name: payload.produto.nome,
                  description: payload.produto.descricao,
                  type: payload.produto.tipo,
                  measure: payload.produto.medida,
                  // ↓ Puxando o preço que a tela enviou ↓
                  price: Number(payload.produto.preco || 0) 
                }
              })
              
              setResponse(result)
              setBusy(null)
              await loadLists()
            }}
            handleExcluir={async (codigo) => {
              setBusy('produto-excluir')
              // Rota de deletar (verifique se a url no Django é essa mesma)
              const result = await requestJson('/product/delete/', 'POST', { 
                code_product: codigo 
              })
              setResponse(result)
              setBusy(null)
              await loadLists()
            }}
            busy={busy}
            response={response} 
          />
        )}

        {/* Estoque removido do frontend */}

        {/* === PEDIDOS === */}
        {section === 'pedido' && (
          <CadastroPedido 
            clientList={clientList} 
            productList={productList} 
            handleSalvarPedido={handleOrderSave} 
            busy={busy} 
            response={response}
          />
        )}
        {section === 'pedido-consulta' && (
          <ConsultaPedido 
            pedidosList={orderList} 
            handleBuscarPedidos={handleOrderSearch} 
            handleAtualizarPedido={handleOrderUpdate}
            handleExcluirPedido={handleOrderDelete}
            busy={busy}
            response={response}
          />
        )}

      </main>
    </div>
  )
} 

export default App
