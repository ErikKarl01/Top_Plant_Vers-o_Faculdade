import type { ApiResponse } from '../../App'
import { MensagemRetorno } from '../../components/layout/MensagemRetorno'
import { useState } from 'react'

type ConsultaPedidoProps = {
  pedidosList: any[]
  handleBuscarPedidos: (filtros: any) => void
  busy: string | null
  
  response: ApiResponse | null
}

export function ConsultaPedido({ pedidosList, handleBuscarPedidos, busy ,response}: ConsultaPedidoProps) {
  const [codigoPedido, setCodigoPedido] = useState('')
  const [codigoCliente, setCodigoCliente] = useState('')
  const [statusPedido, setStatusPedido] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  
  const [pedidoSelecionado, setPedidoSelecionado] = useState<any | null>(null)

  const aplicarFiltros = () => {
    handleBuscarPedidos({
      codigo: codigoPedido,
      cod_cliente: codigoCliente,
      filtro: statusPedido,
      inicio: dataInicio,
      fim: dataFim
    })
    setPedidoSelecionado(null) // Esconde detalhes ao refazer busca
  }

  const limparFiltros = () => {
    setCodigoPedido('')
    setCodigoCliente('')
    setStatusPedido('')
    setDataInicio('')
    setDataFim('')
    handleBuscarPedidos({}) // Dispara busca vazia (listar todos)
    setPedidoSelecionado(null)
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Coluna Esquerda: Filtros e Tabela */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col h-full">
        <div className="mb-6 border-b border-gray-100 pb-4">
          <MensagemRetorno response={response} />
          <h2 className="text-xl font-semibold text-gray-800">Consulta de Pedidos</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input 
            type="text" placeholder="Cód. Pedido (PED-01)" value={codigoPedido} onChange={e => setCodigoPedido(e.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm"
          />
          <input 
            type="text" placeholder="Cód. do Cliente" value={codigoCliente} onChange={e => setCodigoCliente(e.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm"
          />
          <select 
            value={statusPedido} onChange={e => setStatusPedido(e.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm text-gray-600"
          >
            <option value="">Todos os Status</option>
            <option value="Pendente">Pendente</option>
            <option value="Parcialmente Finalizado">Parcialmente Finalizado</option>
            <option value="Finalizado">Finalizado</option>
          </select>
          <input 
            type="date" title="Data Início" value={dataInicio} onChange={e => setDataInicio(e.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm text-gray-600"
          />
          <input 
            type="date" title="Data Fim" value={dataFim} onChange={e => setDataFim(e.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm text-gray-600"
          />
          
          <div className="flex gap-2">
            <button 
              onClick={aplicarFiltros} disabled={busy === 'buscar-pedidos'}
              className="flex-1 bg-[#4BAF47] hover:bg-[#3D943A] text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-70 text-sm"
            >
              Buscar
            </button>
            <button 
              onClick={limparFiltros}
              className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium rounded-xl transition-colors text-sm"
            >
              Limpar
            </button>
          </div>
        </div>

        <div className="border border-gray-100 rounded-xl overflow-hidden flex-1">
          <div className="overflow-x-auto h-full max-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr className="text-gray-500 text-sm border-b border-gray-100">
                  <th className="p-4 font-medium">Código</th>
                  <th className="p-4 font-medium">Cliente</th>
                  <th className="p-4 font-medium">Data</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pedidosList.length > 0 ? (
                  pedidosList.map((item, idx) => {
                    const pedidoObj = item.pedido || item
                    const selecionado = pedidoSelecionado?.pedido?.codigo === pedidoObj.codigo
                    
                    return (
                      <tr 
                        key={idx} 
                        onClick={() => setPedidoSelecionado(item)}
                        className={`cursor-pointer transition-colors ${selecionado ? 'bg-green-50' : 'hover:bg-gray-50'}`}
                      >
                        <td className="p-4 text-gray-800 font-medium">{pedidoObj.codigo || '-'}</td>
                        <td className="p-4 text-gray-600">{pedidoObj.cliente || pedidoObj.cod_cliente || '-'}</td>
                        <td className="p-4 text-gray-600">{pedidoObj.data || '-'}</td>
                        <td className="p-4 text-gray-600">{pedidoObj.status || '-'}</td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400">Nenhum pedido encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Coluna Direita: Detalhes do Pedido */}
      {pedidoSelecionado ? (
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit sticky top-6 animate-fade-in flex flex-col">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b border-gray-100 pb-4">Detalhes</h2>
          
          <div className="space-y-3 mb-6 text-sm">
            <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
              <span className="text-gray-500">Código:</span>
              <span className="font-semibold text-gray-800">{pedidoSelecionado.pedido?.codigo || '-'}</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
              <span className="text-gray-500">Cliente:</span>
              <span className="font-medium text-gray-800 text-right">{pedidoSelecionado.pedido?.cliente || pedidoSelecionado.pedido?.cod_cliente || '-'}</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
              <span className="text-gray-500">Status:</span>
              <span className="font-medium text-gray-800">{pedidoSelecionado.pedido?.status || '-'}</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
              <span className="text-gray-500">Vendedor:</span>
              <span className="font-medium text-gray-800">{pedidoSelecionado.pedido?.nome_vendedor || '-'}</span>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider">Itens do Pedido</h3>
          <div className="flex-1 overflow-y-auto max-h-[300px] space-y-3 pr-2">
            {!pedidoSelecionado.itens || pedidoSelecionado.itens.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Sem itens detalhados.</p>
            ) : (
              pedidoSelecionado.itens.map((itemData: any, idx: number) => {
                const item = itemData.item || itemData
                return (
                  <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm">
                    <p className="font-medium text-gray-800 mb-2">Cód: {item.cod_produto || itemData.cod_produto || '-'}</p>
                    <div className="flex justify-between text-gray-600">
                      <span>Qtd: {item.quantidade || 0}</span>
                      <span>Desc: R$ {Number(item.desconto || 0).toFixed(2)}</span>
                    </div>
                  </div>
                )
              })
            )}
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