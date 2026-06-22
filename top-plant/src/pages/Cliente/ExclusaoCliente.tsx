import { useState } from 'react'

export function ExclusaoCliente() {
  const [docExclude, setDocExclude] = useState('')

  // Esta função ficará pronta para você plugar no App.tsx futuramente
  function handleDelete() {
    if(!docExclude) return
    const confirm = window.confirm('Tem certeza absoluta que deseja excluir este cliente?')
    if(confirm) {
      // alert('Disparar props.handleDelete(docExclude) aqui!')
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-10 animate-fade-in">
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
            className="w-full px-8 py-3 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white font-medium rounded-xl transition-colors mt-4"
          >
            Excluir Permanentemente
          </button>
        </div>
      </div>
    </div>
  )
}