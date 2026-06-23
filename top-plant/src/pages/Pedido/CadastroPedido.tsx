import type { ApiResponse } from '../../App'
import { MensagemRetorno } from '../../components/layout/MensagemRetorno'
import { useState, useMemo } from 'react'

type ProdutoSelecionado = {
  produto: any
  quantidade: number
  desconto: number
}

type CadastroPedidoProps = {
  clientList: any[]
  productList: any[]
  // Função que o App.tsx vai passar para enviar o payload montado
  handleSalvarPedido: (payload: any) => void
  busy: string | null
  response: ApiResponse | null
}

export function CadastroPedido({ clientList, productList, handleSalvarPedido, busy,response }: CadastroPedidoProps) {
  // Estados do formulário
  const [codigoPedido, setCodigoPedido] = useState('')
  const [nomeVendedor, setNomeVendedor] = useState('')
  const [clienteSelecionado, setClienteSelecionado] = useState<any | null>(null)
  const [produtosSelecionados, setProdutosSelecionados] = useState<ProdutoSelecionado[]>([])

  // Estados de filtro
  const [filtroCliente, setFiltroCliente] = useState('')
  const [filtroProduto, setFiltroProduto] = useState('')

  // Filtros dinâmicos (substituem o `onkeyup` do HTML)
  const clientesFiltrados = useMemo(() => {
    return clientList.filter(item => {
      const c = item.cliente || item
      const texto = `${c.codigo} ${c.nome} ${c.cnpj}`.toLowerCase()
      return texto.includes(filtroCliente.toLowerCase())
    })
  }, [clientList, filtroCliente])

  const produtosFiltrados = useMemo(() => {
    return productList.filter(item => {
      const p = item.produto || item
      const texto = `${p.codigo} ${p.nome}`.toLowerCase()
      return texto.includes(filtroProduto.toLowerCase())
    })
  }, [productList, filtroProduto])

  // Ações de Produtos
  const handleAdicionarProduto = (prodItem: any) => {
    const prod = prodItem.produto || prodItem
    const index = produtosSelecionados.findIndex(p => p.produto.codigo === prod.codigo)
    
    if (index >= 0) {
      const novaLista = [...produtosSelecionados]
      novaLista[index].quantidade += 1
      setProdutosSelecionados(novaLista)
    } else {
      setProdutosSelecionados([...produtosSelecionados, { produto: prod, quantidade: 1, desconto: 0 }])
    }
  }

  const handleRemoverProduto = (index: number) => {
    const novaLista = [...produtosSelecionados]
    novaLista.splice(index, 1)
    setProdutosSelecionados(novaLista)
  }

  const handleAlterarItem = (index: number, campo: 'quantidade' | 'desconto', valor: number) => {
    const novaLista = [...produtosSelecionados]
    novaLista[index][campo] = valor
    setProdutosSelecionados(novaLista)
  }

  // Fechamento do Pedido
  const onSubmit = () => {
    if (!codigoPedido || !nomeVendedor) return alert('Preencha o código do pedido e o vendedor.')
    if (!clienteSelecionado) return alert('Selecione um cliente para o pedido.')
    if (produtosSelecionados.length === 0) return alert('Adicione pelo menos um produto.')

    const invalido = produtosSelecionados.some(p => !p.quantidade || p.quantidade <= 0)
    if (invalido) return alert('Verifique as quantidades dos produtos adicionados.')

    const payload = {
      cod_cliente: clienteSelecionado.codigo,
      pedido: {
        codigo: codigoPedido,
        nome_vendedor: nomeVendedor,
        desconto: false 
      },
      itens: produtosSelecionados.map(p => ({
        cod_produto: p.produto.codigo,
        item: {
          quantidade: Number(p.quantidade),
          desconto: Number(p.desconto)
        }
      }))
    }

    handleSalvarPedido(payload)
    
    // Limpar formulário após envio (opcional, pode depender da resposta do backend no App.tsx)
    setCodigoPedido('')
    setNomeVendedor('')
    setClienteSelecionado(null)
    setProdutosSelecionados([])
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Coluna Esquerda: Dados, Clientes e Produtos */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <MensagemRetorno response={response} />
        {/* Card 1: Dados Base */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Dados do Pedido</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Código do Pedido</label>
              <input 
                type="text" 
                value={codigoPedido} onChange={(e) => setCodigoPedido(e.target.value)}
                placeholder="Ex: PED-001"
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Vendedor</label>
              <input 
                type="text" 
                value={nomeVendedor} onChange={(e) => setNomeVendedor(e.target.value)}
                placeholder="Nome do vendedor"
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Cliente */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Selecionar Cliente</h2>
          <input 
            type="text" 
            placeholder="Buscar por nome ou código..." 
            value={filtroCliente} onChange={(e) => setFiltroCliente(e.target.value)}
            className="w-full px-4 py-3 mb-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
          />
          <div className="border border-gray-100 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0">
                <tr className="text-gray-500 text-sm border-b border-gray-100">
                  <th className="p-3 font-medium">Código</th>
                  <th className="p-3 font-medium">Nome</th>
                  <th className="p-3 font-medium">Documento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clientesFiltrados.map((item, idx) => {
                  const c = item.cliente || item
                  return (
                    <tr 
                      key={idx} 
                      onClick={() => setClienteSelecionado(c)}
                      className="cursor-pointer hover:bg-green-50 transition-colors"
                    >
                      <td className="p-3 text-gray-800">{c.codigo}</td>
                      <td className="p-3 text-gray-600">{c.nome}</td>
                      <td className="p-3 text-gray-600">{c.cnpj || c.doc}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card 3: Produtos */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Adicionar Produtos</h2>
          <input 
            type="text" 
            placeholder="Buscar produto por nome ou código..." 
            value={filtroProduto} onChange={(e) => setFiltroProduto(e.target.value)}
            className="w-full px-4 py-3 mb-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
          />
          <div className="border border-gray-100 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0">
                <tr className="text-gray-500 text-sm border-b border-gray-100">
                  <th className="p-3 font-medium">Código</th>
                  <th className="p-3 font-medium">Nome</th>
                  <th className="p-3 font-medium">Tipo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {produtosFiltrados.map((item, idx) => {
                  const p = item.produto || item
                  return (
                    <tr 
                      key={idx} 
                      onClick={() => handleAdicionarProduto(p)}
                      className="cursor-pointer hover:bg-green-50 transition-colors"
                    >
                      <td className="p-3 text-gray-800">{p.codigo}</td>
                      <td className="p-3 text-gray-600">{p.nome}</td>
                      <td className="p-3 text-gray-600">{p.tipo || '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Coluna Direita: Resumo do Pedido */}
      <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit sticky top-6 flex flex-col">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b border-gray-100 pb-4">Resumo</h2>
        
        <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-500 mb-1">Cliente Selecionado:</p>
          <p className="text-gray-800 font-semibold">
            {clienteSelecionado ? `${clienteSelecionado.nome} (${clienteSelecionado.codigo})` : 'Nenhum'}
          </p>
        </div>

        <h3 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider">Itens do Carrinho</h3>
        <div className="flex-1 overflow-y-auto max-h-[400px] space-y-3 mb-6 pr-2">
          {produtosSelecionados.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">Vazio. Selecione produtos ao lado.</p>
          ) : (
            produtosSelecionados.map((item, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative group">
                <p className="font-medium text-gray-800 text-sm mb-3">
                  {item.produto.nome} <span className="text-gray-400 font-normal">({item.produto.codigo})</span>
                </p>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">Qtd.</label>
                    <input 
                      type="number" min="1" value={item.quantidade}
                      onChange={(e) => handleAlterarItem(idx, 'quantidade', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 mt-1 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">Desc. (R$)</label>
                    <input 
                      type="number" step="0.01" min="0" value={item.desconto}
                      onChange={(e) => handleAlterarItem(idx, 'desconto', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 mt-1 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-500"
                    />
                  </div>
                </div>
                <button 
                  onClick={() => handleRemoverProduto(idx)}
                  className="absolute top-3 right-3 text-red-400 hover:text-red-600 transition-colors"
                  title="Remover"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        <button 
          onClick={onSubmit}
          disabled={busy === 'pedido-save'}
          className="w-full px-4 py-4 bg-[#4BAF47] hover:bg-[#3D943A] text-white font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-70 mt-auto"
        >
          {busy === 'pedido-save' ? 'Processando...' : 'Finalizar Pedido'}
        </button>
      </div>

    </div>
  )
}