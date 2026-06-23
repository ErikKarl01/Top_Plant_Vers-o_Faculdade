import { useState, type FormEvent } from 'react'
import type { ApiResponse } from '../../App'
import { MensagemRetorno } from '../../components/layout/MensagemRetorno'

type CadastroProdutoProps = {
  handleCadastrar: (payload: any) => void
  busy: string | null
  response: ApiResponse | null;
}

export function CadastroProduto({ handleCadastrar, busy, response }: CadastroProdutoProps) {
  const [codigo, setCodigo] = useState('')
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('')
  const [medida, setMedida] = useState('')
  const [descricao, setDescricao] = useState('')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const payload = {
      produto: { codigo, nome, descricao, tipo, medida }
    }
    handleCadastrar(payload)
    
    if (busy !== 'produto-save') {
      setCodigo(''); setNome(''); setTipo(''); setMedida(''); setDescricao('');
    }
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="mb-8 border-b border-gray-100 pb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Novo Produto</h2>
          <p className="text-gray-500 text-sm mt-1">Cadastre as informações e especificações do produto.</p>
          
          {/* Adicionado o componente de feedback visual aqui */}
          <div className="mt-4">
            <MensagemRetorno response={response} />
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Código</label>
              <input 
                type="text" required value={codigo} onChange={e => setCodigo(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-700"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Nome</label>
              <input 
                type="text" required value={nome} onChange={e => setNome(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-700"
              />
            </div>
           <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select 
                required 
                value={tipo} 
                onChange={e => setTipo(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-gray-700"
              >
                <option value="">Selecione o tipo...</option>
                <option value="HORTALICAS">Hortaliças</option>
                <option value="ORNAMENTAIS">Ornamentais</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Medida</label>
              <input 
                type="text" required value={medida} onChange={e => setMedida(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-700"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">Descrição</label>
            <textarea 
              required value={descricao} onChange={e => setDescricao(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-700 min-h-[120px] resize-y"
            ></textarea>
          </div>

          <div className="pt-4">
            <button 
              type="submit" disabled={busy === 'produto-save'}
              className="w-full md:w-auto px-8 py-3 bg-[#4BAF47] hover:bg-[#3D943A] text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-70"
            >
              {busy === 'produto-save' ? 'Processando...' : 'Cadastrar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}