import { useEffect, useMemo, useState, type FormEvent } from 'react'
import './App.css'
import { Navbar, type Section } from './components/layout/Navbar'
import { Home } from './pages/Core/Home'
import { CadastroCliente } from './pages/Cliente/CadastroCliente'
import { ConsultaCliente } from './pages/Cliente/ConsultaCliente'
import { ExclusaoCliente } from './pages/Cliente/ExclusaoCliente'
import { CadastroProduto } from './pages/Produto/CadastroProduto'
import { ConsultaProduto } from './pages/Produto/ConsultaProduto'
import { EditarExcluirProduto } from './pages/Produto/EditarExcluirProduto'
import { Estoque } from './pages/Estoque/Estoque'
import { CadastroPedido } from './pages/Pedido/CadastroPedido'
import { ConsultaPedido } from './pages/Pedido/ConsultaPedido'

type ApiResponse = {
  status?: number
  mensage?: string | string[]
  sucess?: boolean
  value?: unknown
}

type ClientForm = {
  code: string
  name: string
  doc_type: string
  doc: string
  contact: string
  email: string
  state_register: string
}

type AddressForm = {
  code_zone: string
  city: string
  people_place: string
  neig_b: string
  number: string
  type: string
}

type ProductForm = {
  code: string
  name: string
  price: string
  description: string
  type: string
  measure: string
  licensed: boolean
  discount: string
}

const apiBase = '/api'

const defaultClient: ClientForm = {
  code: '',
  name: '',
  doc_type: 'CPF',
  doc: '',
  contact: '',
  email: '',
  state_register: '',
}

const defaultAddress: AddressForm = {
  code_zone: '',
  city: '',
  people_place: 'RUA',
  neig_b: '',
  number: '',
  type: 'COMERCIAL',
}

const defaultProduct: ProductForm = {
  code: '',
  name: '',
  price: '',
  description: '',
  type: 'HORTALICAS',
  measure: 'UNIDADE',
  licensed: false,
  discount: '',
}

async function requestJson(path: string, method: 'GET' | 'POST', body?: unknown) {
  const response = await fetch(`${apiBase}${path}`, {
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

function formatMessage(value: unknown) {
  if (value == null) return 'Ainda não houve retorno.'
  if (Array.isArray(value)) return value.join(' ')
  return String(value)
}

function renderClientLine(item: unknown) {
  if (!item || typeof item !== 'object') return 'Cliente sem detalhes.'

  const record = item as { client?: { name?: string; code?: string } }
  const name = record.client?.name?.trim() || 'Cliente sem nome'
  const code = record.client?.code?.trim()

  return code ? `${name} - ${code}` : name
}

function renderProductLine(item: unknown) {
  if (!item || typeof item !== 'object') return 'Produto sem detalhes.'

  const record = item as { name?: string; code?: string }
  const name = record.name?.trim() || 'Produto sem nome'
  const code = record.code?.trim()

  return code ? `${name} - ${code}` : name
}

function App() {
  const [section, setSection] = useState<Section>('inicio')
  const [clientForm, setClientForm] = useState(defaultClient)
  const [addressForm, setAddressForm] = useState(defaultAddress)
  const [productForm, setProductForm] = useState(defaultProduct)
  const [clientList, setClientList] = useState<unknown[]>([])
  const [productList, setProductList] = useState<unknown[]>([])
  const [clientSearch, setClientSearch] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const statusLabel = useMemo(() => {
    if (!response) return 'Pronto para começar'
    return response.sucess ? 'Pedido recebido' : 'Algo pediu atenção'
  }, [response])

  useEffect(() => {
    void loadLists()
  }, [])

  async function loadLists() {
    try {
      const [clients, products] = await Promise.all([
        requestJson('/client/list/', 'GET'),
        requestJson('/product/list/', 'GET'),
      ])

      if (clients.sucess && Array.isArray(clients.value)) setClientList(clients.value)
      if (products.sucess && Array.isArray(products.value)) setProductList(products.value)
    } catch {
      setClientList([])
      setProductList([])
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

  async function handleClientSearch(event: FormEvent) {
    event.preventDefault()
    setBusy('client-search')
    const result = await requestJson('/client/search/', 'POST', {
      code_client: clientSearch,
    })
    setResponse(result)
    setBusy(null)
  }

  async function handleProductSave(event: FormEvent) {
    event.preventDefault()
    setBusy('product-save')
    const result = await requestJson('/product/save/', 'POST', {
      product: {
        ...productForm,
        price: Number(productForm.price || 0),
        discount: Number(productForm.discount || 0),
      },
    })
    setResponse(result)
    setBusy(null)
    await loadLists()
  }

  async function handleProductSearch(event: FormEvent) {
    event.preventDefault()
    setBusy('product-search')
    const result = await requestJson('/product/return/', 'POST', {
      code_product: productSearch,
    })
    setResponse(result)
    setBusy(null)
  }

return (
    <div className="min-h-screen bg-gray-200 flex flex-col font-sans">
      {/* Navbar global controlando as rotas */}
      <Navbar setSection={setSection} />

      <main className="flex-1 w-full p-4 md:p-8">
        
        {/* === CORE === */}
        {section === 'inicio' && <Home setSection={setSection} />}

        {/* === CLIENTES === */}
        {section === 'cliente' && (
          <CadastroCliente 
            clientForm={clientForm} setClientForm={setClientForm}
            addressForm={addressForm} setAddressForm={setAddressForm}
            handleClientSave={handleClientSave} handleAddressSave={handleAddressSave}
            busy={busy}
          />
        )}
        {section === 'cliente-consulta' && (
          <ConsultaCliente 
            clientSearch={clientSearch} setClientSearch={setClientSearch}
            handleClientSearch={handleClientSearch} clientList={clientList} busy={busy}
          />
        )}
        {section === 'cliente-excluir' && <ExclusaoCliente />}

        {/* === PRODUTOS === */}
        {section === 'produto' && (
          <CadastroProduto handleCadastrar={handleProductSave} busy={busy} />
        )}
        {section === 'produto-consulta' && (
          <ConsultaProduto 
            productList={productList} 
            productSearch={productSearch}
            setProductSearch={setProductSearch}
            handleBuscar={handleProductSearch} // Passa a função original intacta
            handleLimpar={() => loadLists()} 
            busy={busy} 
          />
        )}
        {section === 'produto-editar' && (
          <EditarExcluirProduto 
            handleBuscarParaEdicao={async () => { /* Chame sua API aqui */ return null }}
            handleAtualizar={() => { /* Chame sua API aqui */ }}
            handleExcluir={() => { /* Chame sua API aqui */ }}
            busy={busy}
          />
        )}

        {/* === ESTOQUE === */}
        {section === 'estoque' && (
          <Estoque 
            estoqueList={[]} // Crie um estado [estoqueList, setEstoqueList] depois e passe aqui
            processarAcaoEstoque={(acao, codProd, qtd) => { /* Chame sua API de estoque aqui */ }}
            busy={busy}
          />
        )}

        {/* === PEDIDOS === */}
        {section === 'pedido' && (
          <CadastroPedido 
            clientList={clientList} 
            productList={productList} 
            handleSalvarPedido={(payload) => { /* Chame sua API de salvar pedido */ }} 
            busy={busy}
          />
        )}
        {section === 'pedido-consulta' && (
          <ConsultaPedido 
            pedidosList={[]} // Crie um estado [pedidosList, setPedidosList] depois e passe aqui
            handleBuscarPedidos={(filtros) => { /* Chame sua API de filtro de pedidos */ }} 
            busy={busy}
          />
        )}

      </main>
    </div>
  )
} 

export default App