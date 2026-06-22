import type { FormEvent } from 'react'

type ConsultaClienteProps = {
  clientSearch: string
  setClientSearch: (val: string) => void
  handleClientSearch: (e: FormEvent) => void
  clientList: any[]
  busy: string | null
}

export function ConsultaCliente({ 
  clientSearch, setClientSearch, handleClientSearch, clientList, busy 
}: ConsultaClienteProps) {
  
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Barra de Busca */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Buscar Cliente por Código</label>
          <input 
            type="text" 
            placeholder="Digite o código..."
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-700"
          />
        </div>
        <button 
          onClick={handleClientSearch}
          disabled={busy === 'client-search'}
          className="px-8 py-3 bg-[#4BAF47] hover:bg-[#3D943A] text-white font-medium rounded-xl transition-colors shadow-sm whitespace-nowrap"
        >
          {busy === 'client-search' ? 'Buscando...' : 'Pesquisar'}
        </button>
      </div>

      {/* Tabela de Resultados (Estilo Figma) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                <th className="p-4 font-medium">Código</th>
                <th className="p-4 font-medium">Nome</th>
                <th className="p-4 font-medium">Documento</th>
                <th className="p-4 font-medium">Contato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clientList.length > 0 ? (
                clientList.map((item: any, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-800 font-medium">{item.client?.code || '-'}</td>
                    <td className="p-4 text-gray-600">{item.client?.name || 'Cliente sem nome'}</td>
                    <td className="p-4 text-gray-600">{item.client?.doc || '-'}</td>
                    <td className="p-4 text-gray-600">{item.client?.contact || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">
                    Nenhum cliente encontrado na listagem.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}