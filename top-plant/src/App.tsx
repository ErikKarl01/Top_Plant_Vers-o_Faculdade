import { useEffect, useMemo, useState, type FormEvent } from 'react'
import './App.css'

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

type Section = 'inicio' | 'cliente' | 'produto' | 'pedido'

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
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Top Plant</p>
          <h1>Plant System</h1>
          <p className="lead">
            Um caminho simples para cuidar de clientes, produtos e do pedido.
          </p>
        </div>

        <div className="status-panel" aria-live="polite">
          <div>
            <strong>{statusLabel}</strong>
            <p>{formatMessage(response?.mensage)}</p>
          </div>
        </div>
      </header>

      <nav className="nav-tabs" aria-label="Navegação principal">
        <button type="button" className={section === 'inicio' ? 'active' : ''} onClick={() => setSection('inicio')}>
          Início
        </button>
        <button type="button" className={section === 'cliente' ? 'active' : ''} onClick={() => setSection('cliente')}>
          Cliente
        </button>
        <button type="button" className={section === 'produto' ? 'active' : ''} onClick={() => setSection('produto')}>
          Produto
        </button>
        <button type="button" className={section === 'pedido' ? 'active' : ''} onClick={() => setSection('pedido')}>
          Pedido
        </button>
      </nav>

      {section === 'inicio' ? (
        <section className="grid intro-grid">
          <article className="card">
            <h2>Como seguir</h2>
            <p>
              Comece cadastrando o cliente, depois inclua o endereço e siga para o produto.
              O pedido fica separado para manter o caminho claro.
            </p>
          </article>

          <article className="card">
            <h2>Atalhos rápidos</h2>
            <div className="quick-actions">
              <button type="button" onClick={() => setSection('cliente')}>Abrir cliente</button>
              <button type="button" onClick={() => setSection('produto')}>Abrir produto</button>
              <button type="button" onClick={() => setSection('pedido')}>Abrir pedido</button>
            </div>
          </article>

          <article className="card">
            <h2>Retorno recente</h2>
            <p>{formatMessage(response?.mensage)}</p>
          </article>
        </section>
      ) : null}

      {section === 'cliente' ? (
        <section className="section-stack">
          <article className="card">
            <h2>Cliente</h2>
            <p>Preencha os dados do cliente e depois, se quiser, complete o endereço.</p>
            <form className="form" onSubmit={handleClientSave}>
              <div className="field-row">
                <label>
                  Código
                  <input value={clientForm.code} onChange={(e) => setClientForm({ ...clientForm, code: e.target.value })} />
                </label>
                <label>
                  Nome
                  <input value={clientForm.name} onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })} />
                </label>
              </div>
              <div className="field-row">
                <label>
                  Tipo do documento
                  <select value={clientForm.doc_type} onChange={(e) => setClientForm({ ...clientForm, doc_type: e.target.value })}>
                    <option value="CPF">CPF</option>
                    <option value="CNPJ">CNPJ</option>
                  </select>
                </label>
                <label>
                  Documento
                  <input value={clientForm.doc} onChange={(e) => setClientForm({ ...clientForm, doc: e.target.value })} />
                </label>
              </div>
              <div className="field-row">
                <label>
                  Contato
                  <input value={clientForm.contact} onChange={(e) => setClientForm({ ...clientForm, contact: e.target.value })} />
                </label>
                <label>
                  E-mail
                  <input value={clientForm.email} onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })} />
                </label>
              </div>
              <label>
                Inscrição estadual
                <input value={clientForm.state_register} onChange={(e) => setClientForm({ ...clientForm, state_register: e.target.value })} />
              </label>
              <button type="submit" disabled={busy === 'client-save'}>
                {busy === 'client-save' ? 'Salvando...' : 'Salvar cliente'}
              </button>
            </form>
          </article>

          <article className="card">
            <h2>Endereço</h2>
            <p>Use o mesmo cliente para completar o endereço.</p>
            <form className="form" onSubmit={handleAddressSave}>
              <div className="field-row">
                <label>
                  Código da zona
                  <input value={addressForm.code_zone} onChange={(e) => setAddressForm({ ...addressForm, code_zone: e.target.value })} />
                </label>
                <label>
                  Cidade
                  <input value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} />
                </label>
              </div>
              <div className="field-row">
                <label>
                  Tipo do local
                  <select value={addressForm.people_place} onChange={(e) => setAddressForm({ ...addressForm, people_place: e.target.value })}>
                    <option value="RUA">Rua</option>
                    <option value="AVENIDA">Avenida</option>
                    <option value="TRAVESSA">Travessa</option>
                  </select>
                </label>
                <label>
                  Bairro
                  <input value={addressForm.neig_b} onChange={(e) => setAddressForm({ ...addressForm, neig_b: e.target.value })} />
                </label>
              </div>
              <div className="field-row">
                <label>
                  Número
                  <input value={addressForm.number} onChange={(e) => setAddressForm({ ...addressForm, number: e.target.value })} />
                </label>
                <label>
                  Tipo
                  <select value={addressForm.type} onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value })}>
                    <option value="COMERCIAL">Comercial</option>
                    <option value="RESIDENCIAL">Residencial</option>
                  </select>
                </label>
              </div>
              <button type="submit" disabled={busy === 'address-save'}>
                {busy === 'address-save' ? 'Salvando...' : 'Salvar endereço'}
              </button>
            </form>
          </article>

          <article className="card">
            <h2>Buscar cliente</h2>
            <p>Consulte um cliente já cadastrado pelo código.</p>
            <form className="inline-form" onSubmit={handleClientSearch}>
              <input
                placeholder="Digite o código"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
              />
              <button type="submit" disabled={busy === 'client-search'}>
                Buscar
              </button>
            </form>
          </article>
        </section>
      ) : null}

      {section === 'produto' ? (
        <section className="section-stack">
          <article className="card">
            <h2>Produto</h2>
            <p>Cadastre o produto com as informações principais.</p>
            <form className="form" onSubmit={handleProductSave}>
              <div className="field-row">
                <label>
                  Código
                  <input value={productForm.code} onChange={(e) => setProductForm({ ...productForm, code: e.target.value })} />
                </label>
                <label>
                  Nome
                  <input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
                </label>
              </div>
              <div className="field-row">
                <label>
                  Preço
                  <input type="number" step="0.01" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} />
                </label>
                <label>
                  Desconto
                  <input type="number" step="0.01" value={productForm.discount} onChange={(e) => setProductForm({ ...productForm, discount: e.target.value })} />
                </label>
              </div>
              <label>
                Descrição
                <input value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
              </label>
              <div className="field-row">
                <label>
                  Tipo
                  <select value={productForm.type} onChange={(e) => setProductForm({ ...productForm, type: e.target.value })}>
                    <option value="HORTALICAS">Hortaliças</option>
                    <option value="ORNAMENTAIS">Ornamentais</option>
                  </select>
                </label>
                <label>
                  Medida
                  <input value={productForm.measure} onChange={(e) => setProductForm({ ...productForm, measure: e.target.value })} />
                </label>
              </div>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={productForm.licensed}
                  onChange={(e) => setProductForm({ ...productForm, licensed: e.target.checked })}
                />
                Produto licenciado
              </label>
              <button type="submit" disabled={busy === 'product-save'}>
                {busy === 'product-save' ? 'Salvando...' : 'Salvar produto'}
              </button>
            </form>
          </article>

          <article className="card">
            <h2>Buscar produto</h2>
            <p>Consulte um produto já cadastrado pelo código.</p>
            <form className="inline-form" onSubmit={handleProductSearch}>
              <input
                placeholder="Digite o código"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
              <button type="submit" disabled={busy === 'product-search'}>
                Buscar
              </button>
            </form>
          </article>
        </section>
      ) : null}

      {section === 'pedido' ? (
        <section className="section-stack">
          <article className="card">
            <h2>Pedido</h2>
            <p>
              Esta parte está guardada para o fluxo do pedido. Quando o caminho do servidor
              estiver disponível, ela pode receber os itens e concluir o registro.
            </p>
          </article>

          <article className="card">
            <h2>O que já existe</h2>
            <ul className="plain-list">
              <li>Cliente com cadastro e busca.</li>
              <li>Endereço ligado ao cliente.</li>
              <li>Produto com cadastro e busca.</li>
            </ul>
          </article>
        </section>
      ) : null}

      <section className="grid secondary">
        <article className="card list-card">
          <h2>Clientes cadastrados</h2>
          {clientList.length ? (
            <ul className="plain-list">
              {clientList.map((item, index) => (
                <li key={`client-${index}`}>{renderClientLine(item)}</li>
              ))}
            </ul>
          ) : (
            <p>Sem clientes cadastrados por enquanto.</p>
          )}
        </article>

        <article className="card list-card">
          <h2>Produtos cadastrados</h2>
          {productList.length ? (
            <ul className="plain-list">
              {productList.map((item, index) => (
                <li key={`product-${index}`}>{renderProductLine(item)}</li>
              ))}
            </ul>
          ) : (
            <p>Sem produtos cadastrados por enquanto.</p>
          )}
        </article>
      </section>
    </main>
  )
}

export default App
