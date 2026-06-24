import { useMemo, useState } from 'react'
import type { ApiResponse } from '../../App'
import { MensagemRetorno } from '../../components/layout/MensagemRetorno'
import type { OrderListItem, OrderSearchFilters } from '../../types/order'

type ConsultaPedidoProps = {
  pedidosList: OrderListItem[]
  handleBuscarPedidos: (filtros: OrderSearchFilters) => Promise<ApiResponse | void> | void
  handleAtualizarPedido: (codeOrder: string) => Promise<ApiResponse | void> | void
  handleExcluirPedido: (codeOrder: string) => Promise<ApiResponse | void> | void
  busy: string | null
  response: ApiResponse | null
}

type OrderView = {
  code: string
  clientCode: string
  clientName: string
  date: string
  status: string
  items: Array<{
    productCode: string
    productName: string
    amount: number
    price: number
    discount: number
  }>
}

function normalizeOrder(item: OrderListItem | Record<string, unknown>): OrderView {
  const rawOrder = (item as OrderListItem).order ?? (item as { pedido?: Record<string, unknown> }).pedido ?? item
  const order = rawOrder as Record<string, unknown>
  const itemsSource = (item as OrderListItem).order_items ?? (item as { itens?: unknown[] }).itens ?? []

  return {
    code: String(order.code ?? order.codigo ?? '').trim(),
    clientCode: String(order.client_code ?? order.cod_cliente ?? '').trim(),
    clientName: String(order.client_name ?? order.cliente ?? '').trim(),
    date: String(order.date ?? order.data ?? '').trim(),
    status: String(order.status ?? '').trim(),
    items: Array.isArray(itemsSource)
      ? itemsSource.map(rawItem => {
          const item = rawItem as Record<string, unknown>
          return {
            productCode: String(item.product_code ?? item.cod_produto ?? '').trim(),
            productName: String(item.product_name ?? item.nome_produto ?? '').trim(),
            amount: Number(item.amount ?? item.quantidade ?? 0),
            price: Number(item.price ?? item.preco ?? 0),
            discount: Number(item.discount ?? item.desconto ?? 0),
          }
        })
      : [],
  }
}

export function ConsultaPedido({
  pedidosList,
  handleBuscarPedidos,
  handleAtualizarPedido,
  handleExcluirPedido,
  busy,
  response,
}: ConsultaPedidoProps) {
  const [codigoPedido, setCodigoPedido] = useState('')
  const [codigoCliente, setCodigoCliente] = useState('')
  const [statusPedido, setStatusPedido] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [pedidoSelecionado, setPedidoSelecionado] = useState<OrderView | null>(null)

  const pedidos = useMemo(() => pedidosList.map(normalizeOrder).filter(order => order.code), [pedidosList])

  const aplicarFiltros = async () => {
    const result = await handleBuscarPedidos({
      code_order: codigoPedido,
      code_client: codigoCliente,
      status: statusPedido,
      start: dataInicio,
      end: dataFim,
    })

    if (result !== undefined) {
      setPedidoSelecionado(null)
    }
  }

  const limparFiltros = async () => {
    setCodigoPedido('')
    setCodigoCliente('')
    setStatusPedido('')
    setDataInicio('')
    setDataFim('')
    await handleBuscarPedidos({})
    setPedidoSelecionado(null)
  }

  const selectedCode = pedidoSelecionado?.code ?? ''

  return (
    <div className="max-w-7xl mx-auto animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col h-full">
        <div className="mb-6 border-b border-gray-100 pb-4">
          <MensagemRetorno response={response} />
          <h2 className="text-xl font-semibold text-gray-800">Consulta de Pedidos</h2>
        </div>

        <form
          onSubmit={event => {
            event.preventDefault()
            void aplicarFiltros()
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <input
            type="text"
            placeholder="Cód. Pedido (PD...)"
            value={codigoPedido}
            onChange={event => setCodigoPedido(event.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm"
          />
          <input
            type="text"
            placeholder="Cód. do Cliente"
            value={codigoCliente}
            onChange={event => setCodigoCliente(event.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm"
          />
          <select
            value={statusPedido}
            onChange={event => setStatusPedido(event.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm text-gray-600"
          >
            <option value="">Todos os Status</option>
            <option value="PENDENTE">Pendente</option>
            <option value="PARCIALMENTE ATENDIDO">Parcialmente atendido</option>
            <option value="FINALIZADO">Finalizado</option>
          </select>
          <input
            type="date"
            title="Data Início"
            value={dataInicio}
            onChange={event => setDataInicio(event.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm text-gray-600"
          />
          <input
            type="date"
            title="Data Fim"
            value={dataFim}
            onChange={event => setDataFim(event.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm text-gray-600"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy === 'pedido-search'}
              className="flex-1 bg-[#4BAF47] hover:bg-[#3D943A] text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-70 text-sm"
            >
              {busy === 'pedido-search' ? 'Buscando...' : 'Buscar'}
            </button>
            <button
              type="button"
              onClick={() => { void limparFiltros() }}
              className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium rounded-xl transition-colors text-sm"
            >
              Limpar
            </button>
          </div>
        </form>

        <div className="border border-gray-100 rounded-xl overflow-hidden flex-1">
          <div className="overflow-x-auto h-full max-h-[420px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr className="text-gray-500 text-sm border-b border-gray-100">
                  <th className="p-4 font-medium">Código</th>
                  <th className="p-4 font-medium">Cliente</th>
                  <th className="p-4 font-medium">Data</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Itens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pedidos.length > 0 ? (
                  pedidos.map(order => {
                    const isSelected = selectedCode === order.code

                    return (
                      <tr
                        key={order.code}
                        onClick={() => setPedidoSelecionado(order)}
                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-green-50' : 'hover:bg-gray-50'}`}
                      >
                        <td className="p-4 text-gray-800 font-medium">{order.code}</td>
                        <td className="p-4 text-gray-600">{order.clientName || order.clientCode || '-'}</td>
                        <td className="p-4 text-gray-600">{order.date || '-'}</td>
                        <td className="p-4 text-gray-600">{order.status || '-'}</td>
                        <td className="p-4 text-gray-600">{order.items.length}</td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">Nenhum pedido encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {pedidoSelecionado ? (
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit sticky top-6 animate-fade-in flex flex-col gap-5">
          <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-100 pb-4">Detalhes do Pedido</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-dashed border-gray-200 pb-2 gap-3">
              <span className="text-gray-500">Código:</span>
              <span className="font-semibold text-gray-800 text-right">{pedidoSelecionado.code}</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-gray-200 pb-2 gap-3">
              <span className="text-gray-500">Cliente:</span>
              <span className="font-medium text-gray-800 text-right">{pedidoSelecionado.clientName || pedidoSelecionado.clientCode || '-'}</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-gray-200 pb-2 gap-3">
              <span className="text-gray-500">Status:</span>
              <span className="font-medium text-gray-800 text-right">{pedidoSelecionado.status || '-'}</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-gray-200 pb-2 gap-3">
              <span className="text-gray-500">Data:</span>
              <span className="font-medium text-gray-800 text-right">{pedidoSelecionado.date || '-'}</span>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Itens do Pedido</h3>
          <div className="flex-1 overflow-y-auto max-h-[300px] space-y-3 pr-2">
            {pedidoSelecionado.items.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Sem itens detalhados.</p>
            ) : (
              pedidoSelecionado.items.map(item => (
                <div key={`${item.productCode}-${item.productName}`} className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm">
                  <p className="font-medium text-gray-800 mb-2">{item.productName || item.productCode || '-'}</p>
                  <p className="text-gray-500 text-xs mb-2">Cód: {item.productCode || '-'}</p>
                  <div className="flex justify-between text-gray-600">
                    <span>Qtd: {item.amount}</span>
                    <span>Desc: R$ {Number(item.discount || 0).toFixed(2)}</span>
                  </div>
                  <div className="mt-2 text-gray-600 text-xs">
                    Preço: R$ {Number(item.price || 0).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy === 'pedido-update'}
              onClick={() => void handleAtualizarPedido(pedidoSelecionado.code)}
              className="flex-1 px-4 py-3 bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#C8E6C9] font-medium rounded-xl transition-colors disabled:opacity-70"
            >
              {busy === 'pedido-update' ? 'Atualizando...' : 'Atualizar status'}
            </button>
            <button
              type="button"
              disabled={busy === 'pedido-delete'}
              onClick={() => void handleExcluirPedido(pedidoSelecionado.code)}
              className="px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-xl transition-colors disabled:opacity-70"
            >
              {busy === 'pedido-delete' ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        </div>
      ) : (
        <div className="lg:col-span-1 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-8 text-gray-400 h-64 md:h-full">
          <p className="text-center font-medium">Selecione um pedido na tabela para visualizar os detalhes.</p>
        </div>
      )}
    </div>
  )
}
