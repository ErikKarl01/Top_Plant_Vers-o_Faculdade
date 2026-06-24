import type { FormEvent } from 'react'
import type { ApiResponse } from '../../App'
import { MensagemRetorno } from '../../components/layout/MensagemRetorno'
import type { ClientLookupItem } from '../../types/client'

type ConsultaClienteProps = {
  clientSearch: string
  setClientSearch: (val: string) => void
  handleClientSearch: (e: FormEvent) => void
  clientList: ClientLookupItem[]
  busy: string | null
  response: ApiResponse | null
}

export function ConsultaCliente({ 
  clientSearch, setClientSearch, handleClientSearch, clientList, busy, response 
}: ConsultaClienteProps) {
  
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      
      <MensagemRetorno response={response} />

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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                <th className="p-4 font-medium">Código</th>
                <th className="p-4 font-medium">Nome</th>
                <th className="p-4 font-medium">Documento</th>
                <th className="p-4 font-medium">Contato</th>
                <th className="p-4 font-medium">Endereço</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clientList.length > 0 ? (
                clientList.map((item, index) => {
                  const client = item.client || {}
                  const adress = item.adress || undefined
                  const addressLabel = adress
                    ? [
                        adress.code_zone,
                        adress.people_place,
                        adress.neig_b,
                        adress.number,
                        adress.city,
                        adress.type,
                      ].filter(Boolean).join(' - ')
                    : 'Sem endereço cadastrado'

                  return (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-800 font-medium">{client.code || '-'}</td>
                    <td className="p-4 text-gray-600">{client.name || 'Cliente sem nome'}</td>
                    <td className="p-4 text-gray-600">{client.doc || '-'}</td>
                    <td className="p-4 text-gray-600">{client.contact || '-'}</td>
                    <td className="p-4 text-gray-600">{addressLabel}</td>
                  </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    Nenhum cliente buscado ainda.
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