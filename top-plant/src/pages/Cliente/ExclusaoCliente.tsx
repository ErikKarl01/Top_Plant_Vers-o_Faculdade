import { useState, useMemo } from 'react'
import type { ApiResponse } from '../../App'
import { MensagemRetorno } from '../../components/layout/MensagemRetorno'
import type { ClientListItem } from '../../types/client'

// Adicionada a tipagem para receber a resposta e a função de deletar
type ExclusaoClienteProps = {
  clientList: ClientListItem[]
  handleDeleteClient?: (code: string) => void
  busy?: string | null
  response: ApiResponse | null
}

export function ExclusaoCliente({ clientList, handleDeleteClient, busy, response }: ExclusaoClienteProps) {
  const [selectedClientCode, setSelectedClientCode] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredClients = useMemo(() => {
    return clientList.filter(c => {
      const name = c.name || c.nome || ''
      const code = c.code || c.codigo || ''
      const query = searchQuery.toLowerCase()
      return name.toLowerCase().includes(query) || code.toLowerCase().includes(query)
    })
  }, [clientList, searchQuery])

  function handleDelete() {
    if(!selectedClientCode) return
    const confirm = window.confirm('Tem certeza absoluta que deseja excluir este cliente?')
    if(confirm && handleDeleteClient) {
      handleDeleteClient(selectedClientCode)
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-10 animate-fade-in space-y-6">
      
      <MensagemRetorno response={response} />

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-red-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 font-bold text-xl">
            !
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Área Restrita</h2>
        </div>
        
        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
          A exclusão de um cliente apagará permanentemente seu registro e endereço associado. Esta ação não pode ser desfeita.
        </p>

        <div className="space-y-6">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">Buscar Cliente</label>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nome ou código do cliente..."
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 outline-none transition-all text-gray-700"
            />
          </div>

          <div className="border border-gray-100 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0">
                <tr className="text-gray-500 text-sm border-b border-gray-100">
                  <th className="p-3 font-medium">Código</th>
                  <th className="p-3 font-medium">Nome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredClients.length > 0 ? (
                  filteredClients.map(client => {
                    const code = client.code || client.codigo || 'N/A'
                    const name = client.name || client.nome || 'Sem nome'
                    const isSelected = selectedClientCode === code
                    return (
                      <tr 
                        key={code} 
                        onClick={() => setSelectedClientCode(code)}
                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-red-100' : 'hover:bg-gray-50'}`}
                      >
                        <td className="p-3 text-gray-800 font-medium">{code}</td>
                        <td className="p-3 text-gray-600">{name}</td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={2} className="p-6 text-center text-gray-400">Nenhum cliente encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">Cliente Selecionado</label>
            <div className="px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-800 font-semibold">
              {selectedClientCode || 'Nenhum cliente selecionado'}
            </div>
          </div>

          <button 
            onClick={handleDelete}
            disabled={!selectedClientCode || busy === 'client-delete'}
            className="w-full px-8 py-3 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white font-medium rounded-xl transition-colors mt-4 disabled:opacity-50"
          >
            {busy === 'client-delete' ? 'Excluindo...' : 'Excluir Permanentemente'}
          </button>
        </div>
      </div>
    </div>
  )
}