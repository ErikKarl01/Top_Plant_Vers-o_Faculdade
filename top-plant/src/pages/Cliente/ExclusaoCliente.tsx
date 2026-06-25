import { useState } from 'react'
import type { ApiResponse } from '../../App'
import { MensagemRetorno } from '../../components/layout/MensagemRetorno'

// Adicionada a tipagem para receber a resposta e a função de deletar
type ExclusaoClienteProps = {
  handleDeleteClient?: (doc: string) => void
  busy?: string | null
  response: ApiResponse | null
}

export function ExclusaoCliente({ handleDeleteClient, busy, response }: ExclusaoClienteProps) {
  const [docExclude, setDocExclude] = useState('')

  function handleDelete() {
    if(!docExclude) return
    const confirm = window.confirm('Tem certeza absoluta que deseja excluir este cliente?')
    if(confirm && handleDeleteClient) {
      handleDeleteClient(docExclude)
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

        <div className="space-y-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">Documento do Cliente (CPF/CNPJ)</label>
            <input 
              type="text" 
              value={docExclude}
              onChange={(e) => setDocExclude(e.target.value)}
              placeholder="Digite o documento exato..."
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 outline-none transition-all text-gray-700"
            />
          </div>

          <button 
            onClick={handleDelete}
            disabled={busy === 'client-delete'}
            className="w-full px-8 py-3 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white font-medium rounded-xl transition-colors mt-4 disabled:opacity-70"
          >
            {busy === 'client-delete' ? 'Excluindo...' : 'Excluir Permanentemente'}
          </button>
        </div>
      </div>
    </div>
  )
}