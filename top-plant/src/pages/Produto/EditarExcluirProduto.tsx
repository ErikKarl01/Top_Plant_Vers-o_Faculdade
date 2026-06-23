import { useState } from 'react'
import type { ApiResponse } from '../../App'
import { MensagemRetorno } from '../../components/layout/MensagemRetorno'

type EditarExcluirProdutoProps = {
  handleBuscarParaEdicao: (codigo: string, nome: string) => Promise<any | null>
  handleAtualizar: (payload: any) => void
  handleExcluir: (codigo: string) => void
  busy: string | null
  response: ApiResponse | null
}

export function EditarExcluirProduto({ handleBuscarParaEdicao, handleAtualizar, handleExcluir, busy, response }: EditarExcluirProdutoProps) {
  const [codigoBusca, setCodigoBusca] = useState('')
  const [nomeBusca, setNomeBusca] = useState('')
  const [codigoOriginal, setCodigoOriginal] = useState('')
  const [produtoEditando, setProdutoEditando] = useState<boolean>(false)
  const [codigo, setCodigo] = useState('')
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('')
  const [medida, setMedida] = useState('')
  const [descricao, setDescricao] = useState('')

  const buscarProduto = async () => {
    if (!codigoBusca && !nomeBusca) {
      alert('Preencha o código ou o nome para buscar.')
      return
    }
    const p = await handleBuscarParaEdicao(codigoBusca, nomeBusca)
    if (p) {
      setCodigoOriginal(p.codigo)
      setCodigo(p.codigo || ''); setNome(p.nome || ''); setTipo(p.tipo || ''); setMedida(p.medida || ''); setDescricao(p.descricao || '');
      setProdutoEditando(true)
    } else {
      setProdutoEditando(false)
    }
  }

 const aoAtualizar = () => {
    const payload = {
      codigo: codigoOriginal,
      produto: { codigo, nome, descricao, tipo, medida }
    }
    
    handleAtualizar(payload)
    
    // CORREÇÃO: Removemos o setCodigoOriginal problemático.
    // Em vez disso, fechamos a edição e limpamos a busca para manter a segurança dos dados.
    setProdutoEditando(false)
    setCodigoBusca('')
    setNomeBusca('')
  }

  const aoExcluir = () => {
    const confirmar = window.confirm('Deseja realmente excluir este produto? Essa ação não pode ser desfeita.')
    if (confirmar) {
      handleExcluir(codigoOriginal)
      setProdutoEditando(false)
      setCodigoBusca(''); setNomeBusca('');
    }
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="mb-6 border-b border-gray-100 pb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Editar / Excluir Produto</h2>
          <p className="text-gray-500 text-sm mt-1">Busque o produto para liberar o formulário de alteração.</p>
          <div className="mt-4"><MensagemRetorno response={response} /></div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input type="text" placeholder="Buscar por código" value={codigoBusca} onChange={e => setCodigoBusca(e.target.value)} className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
          <input type="text" placeholder="Buscar por nome" value={nomeBusca} onChange={e => setNomeBusca(e.target.value)} className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
          <button onClick={buscarProduto} disabled={busy === 'produto-buscar'} className="px-8 py-3 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-xl transition-colors disabled:opacity-70">Buscar</button>
        </div>

        {produtoEditando && (
          <div className="animate-fade-in border-t border-gray-100 pt-8 mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Dados do Produto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">Código</label>
                <input type="text" value={codigo} onChange={e => setCodigo(e.target.value)} className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">Nome</label>
                <input type="text" value={nome} onChange={e => setNome(e.target.value)} className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <input type="text" value={tipo} onChange={e => setTipo(e.target.value)} className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">Medida</label>
                <input type="text" value={medida} onChange={e => setMedida(e.target.value)} className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
              </div>
            </div>
            <div className="flex flex-col mb-8">
              <label className="text-sm font-medium text-gray-700 mb-2">Descrição</label>
              <textarea value={descricao} onChange={e => setDescricao(e.target.value)} className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none min-h-[120px] resize-y"></textarea>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <button onClick={aoAtualizar} disabled={!!busy} className="flex-1 py-3 bg-[#4BAF47] hover:bg-[#3D943A] text-white font-medium rounded-xl transition-colors">Atualizar Produto</button>
              <button onClick={aoExcluir} disabled={!!busy} className="flex-1 py-3 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white font-medium rounded-xl transition-colors">Excluir Produto</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}