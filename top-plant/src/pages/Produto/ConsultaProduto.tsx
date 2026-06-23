import type { FormEvent } from 'react'
import type { ApiResponse } from '../../App'
import { MensagemRetorno } from '../../components/layout/MensagemRetorno'

type ConsultaProdutoProps = {
  productList: any[]
  productSearch: string
  setProductSearch: (val: string) => void
  handleBuscar: (e: FormEvent) => void
  handleLimpar: () => void
  busy: string | null
  response: ApiResponse | null
}

export function ConsultaProduto({ 
  productList, 
  productSearch, 
  setProductSearch, 
  handleBuscar, 
  handleLimpar, 
  busy,
  response 
}: ConsultaProdutoProps) {
  
  const aoLimpar = () => {
    setProductSearch('')
    handleLimpar()
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in space-y-6">
      
      {/* Alerta Visual de Busca */}
      <MensagemRetorno response={response} />

      <form onSubmit={handleBuscar} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input 
            type="text" 
            placeholder="Buscar por código..." 
            value={productSearch} 
            onChange={e => setProductSearch(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-gray-700"
          />
        </div>
        
        <div className="flex gap-2">
          <button 
            type="submit" 
            disabled={busy === 'product-search'}
            className="px-8 py-3 bg-[#4BAF47] hover:bg-[#3D943A] text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-70"
          >
            Buscar
          </button>
          <button 
            type="button"
            onClick={aoLimpar}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium rounded-xl transition-colors"
          >
            Limpar
          </button>
        </div>
      </form>

      {/* Tabela de Produtos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-gray-500 text-sm">
                <th className="p-4 font-medium">Código</th>
                <th className="p-4 font-medium">Nome</th>
                <th className="p-4 font-medium">Descrição</th>
                <th className="p-4 font-medium">Tipo</th>
                <th className="p-4 font-medium">Medida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {productList.length > 0 ? (
                productList.map((item, index) => {
                  const p = item.produto || item
                  
                  // CORREÇÃO APLICADA AQUI: 
                  // Puxando as chaves em inglês que vêm do ProductDTO do backend
                  const codigo = p.codigo || p.code || '-'
                  const nome = p.nome || p.name || '-'
                  const descricao = p.descricao || p.description || '-'
                  const tipo = p.tipo || p.type || '-'
                  const medida = p.medida || p.measure || '-'

                  return (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-gray-800 font-medium">{codigo}</td>
                      <td className="p-4 text-gray-600">{nome}</td>
                      <td className="p-4 text-gray-600 max-w-xs truncate" title={descricao}>{descricao}</td>
                      <td className="p-4 text-gray-600">{tipo}</td>
                      <td className="p-4 text-gray-600">{medida}</td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">Nenhum produto encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}