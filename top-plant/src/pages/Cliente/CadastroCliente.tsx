import type { FormEvent } from 'react'

// Tipagens baseadas no seu App.tsx
type CadastroClienteProps = {
  clientForm: any
  setClientForm: (val: any) => void
  addressForm: any
  setAddressForm: (val: any) => void
  handleClientSave: (e: FormEvent) => void
  handleAddressSave: (e: FormEvent) => void
  busy: string | null
}

export function CadastroCliente({
  clientForm, setClientForm,
  addressForm, setAddressForm,
  handleClientSave, handleAddressSave, busy
}: CadastroClienteProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Bloco: Dados do Cliente */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="mb-6 border-b border-gray-100 pb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Novo Cliente</h2>
          <p className="text-gray-500 text-sm mt-1">Cadastre os dados do cliente e depois registre o endereço.</p>
        </div>

        <form onSubmit={handleClientSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Nome</label>
              <input 
                type="text" 
                value={clientForm.name} 
                onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-700"
                placeholder="Nome completo ou Razão Social"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Código</label>
              <input 
                type="text" 
                value={clientForm.code} 
                onChange={(e) => setClientForm({ ...clientForm, code: e.target.value })}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-700"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Documento ({clientForm.doc_type})
              </label>
              <div className="flex gap-2">
                <select 
                  value={clientForm.doc_type}
                  onChange={(e) => setClientForm({ ...clientForm, doc_type: e.target.value })}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-gray-700"
                >
                  <option value="CPF">CPF</option>
                  <option value="CNPJ">CNPJ</option>
                </select>
                <input 
                  type="text" 
                  value={clientForm.doc} 
                  onChange={(e) => setClientForm({ ...clientForm, doc: e.target.value })}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-700"
                  placeholder="Apenas números"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Contato</label>
              <input 
                type="text" 
                value={clientForm.contact} 
                onChange={(e) => setClientForm({ ...clientForm, contact: e.target.value })}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-700"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">E-mail</label>
              <input 
                type="email" 
                value={clientForm.email} 
                onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-700"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Inscrição Estadual</label>
              <input 
                type="text" 
                value={clientForm.state_register} 
                onChange={(e) => setClientForm({ ...clientForm, state_register: e.target.value })}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-700"
              />
            </div>
          </div>
          <div className="pt-4">
            <button 
              type="submit" 
              disabled={busy === 'client-save'}
              className="w-full md:w-auto px-8 py-3 bg-[#4BAF47] hover:bg-[#3D943A] text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-70"
            >
              {busy === 'client-save' ? 'Salvando...' : 'Salvar Cliente'}
            </button>
          </div>
        </form>
      </div>

      {/* Bloco: Endereço (Mantendo a lógica de separação que havia no seu HTML) */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="mb-6 border-b border-gray-100 pb-4">
          <h3 className="text-xl font-semibold text-gray-800">Endereço</h3>
          <p className="text-gray-500 text-sm mt-1">Vincule o endereço ao cliente recém-cadastrado.</p>
        </div>

        <form onSubmit={handleAddressSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">CEP (Cód. Zona)</label>
              <input 
                type="text" 
                value={addressForm.code_zone} 
                onChange={(e) => setAddressForm({ ...addressForm, code_zone: e.target.value })}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-700"
              />
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-2">Cidade</label>
              <input 
                type="text" 
                value={addressForm.city} 
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-700"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Tipo de Local</label>
              <select 
                value={addressForm.people_place} 
                onChange={(e) => setAddressForm({ ...addressForm, people_place: e.target.value })}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-gray-700"
              >
                <option value="RUA">Rua</option>
                <option value="AVENIDA">Avenida</option>
                <option value="TRAVESSA">Travessa</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Bairro</label>
              <input 
                type="text" 
                value={addressForm.neig_b} 
                onChange={(e) => setAddressForm({ ...addressForm, neig_b: e.target.value })}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-700"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Número</label>
              <input 
                type="text" 
                value={addressForm.number} 
                onChange={(e) => setAddressForm({ ...addressForm, number: e.target.value })}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-700"
              />
            </div>
          </div>
          <div className="pt-4">
            <button 
              type="submit" 
              disabled={busy === 'address-save'}
              className="w-full md:w-auto px-8 py-3 bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#C8E6C9] font-medium rounded-xl transition-colors disabled:opacity-70"
            >
              {busy === 'address-save' ? 'Salvando...' : 'Salvar Endereço'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}