import { useState, useMemo } from 'react'

// Mapeador auxiliar fiel à sua lógica original para evitar quebra de JSON
function extrairDadosItem(item: any) {
  const prodInterno = item.produto || {}
  return {
    codigo: item.cod_prod || item.codigo || item.produto_id || prodInterno.codigo || prodInterno.cod_prod || prodInterno.id || '',
    nome: item.nome || item.produto_nome || item.nome_produto || prodInterno.nome || prodInterno.produto_nome || '',
    tipo: item.tipo || prodInterno.tipo || '-',
    quantidade: item.quantidade !== undefined ? item.quantidade : 0,
  }
}

type EstoqueProps = {
  estoqueList: any[]
  // Função que o App.tsx vai passar para gerenciar a chamada na API
  processarAcaoEstoque: (acao: 'criar' | 'adicionar' | 'remover', codProd: string, qtd: number) => void
  busy: string | null
}

export function Estoque({ estoqueList = [], processarAcaoEstoque, busy }: EstoqueProps) {
  // Estados locais para controlar apenas a interface desta tela
  const [filtroCodigo, setFiltroCodigo] = useState('')
  const [filtroNome, setFiltroNome] = useState('')
  const [codProdPainel, setCodProdPainel] = useState('')
  const [quantidade, setQuantidade] = useState<string>('')

  // Lógica de filtro reativa (substitui o antigo evento de 'input')
  const estoqueFiltrado = useMemo(() => {
    return estoqueList.filter((item) => {
      const dadosTratados = extrairDadosItem(item)
      const valCodigo = String(dadosTratados.codigo).toLowerCase()
      const valNome = String(dadosTratados.nome).toLowerCase()
      
      return valCodigo.includes(filtroCodigo.toLowerCase()) && 
             valNome.includes(filtroNome.toLowerCase())
    })
  }, [estoqueList, filtroCodigo, filtroNome])

  const handleAcao = (acao: 'criar' | 'adicionar' | 'remover') => {
    if (!codProdPainel || !quantidade || Number(quantidade) < 1) {
      alert('Preencha o código do produto e uma quantidade válida.')
      return
    }
    processarAcaoEstoque(acao, codProdPainel, Number(quantidade))
    // Limpa a quantidade após a ação, mantendo o código selecionado
    setQuantidade('')
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lado Esquerdo: Tabela e Filtros (Ocupa 2 colunas no Desktop) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col h-full">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Itens em Estoque</h2>
            <p className="text-gray-500 text-sm mt-1">Consulte os produtos e quantidades disponíveis.</p>
          </div>

          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input 
              type="text" 
              placeholder="Buscar por código..." 
              value={filtroCodigo}
              onChange={(e) => setFiltroCodigo(e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-700"
            />
            <input 
              type="text" 
              placeholder="Buscar por nome..." 
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-700"
            />
          </div>

          {/* Tabela */}
          <div className="border border-gray-100 rounded-xl overflow-hidden flex-1">
            <div className="overflow-x-auto h-full max-h-[500px]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr className="text-gray-500 text-sm border-b border-gray-100">
                    <th className="p-4 font-medium">Código</th>
                    <th className="p-4 font-medium">Produto</th>
                    <th className="p-4 font-medium">Tipo</th>
                    <th className="p-4 font-medium">Quantidade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {estoqueFiltrado.length > 0 ? (
                    estoqueFiltrado.map((item, index) => {
                      const dados = extrairDadosItem(item)
                      const isSelecionado = codProdPainel === dados.codigo

                      return (
                        <tr 
                          key={index} 
                          onClick={() => setCodProdPainel(String(dados.codigo))}
                          className={`cursor-pointer transition-colors ${isSelecionado ? 'bg-green-50' : 'hover:bg-gray-50'}`}
                        >
                          <td className="p-4 text-gray-800 font-medium">{dados.codigo}</td>
                          <td className="p-4 text-gray-600">{dados.nome}</td>
                          <td className="p-4 text-gray-600">{dados.tipo}</td>
                          <td className="p-4 text-gray-800 font-semibold">{dados.quantidade}</td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-400">
                        Nenhum item encontrado no estoque.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Lado Direito: Painel de Gerenciamento (Ocupa 1 coluna no Desktop) */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 h-fit sticky top-6">
          <div className="mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-semibold text-gray-800">Gerenciar</h2>
            <p className="text-gray-500 text-sm mt-1">Altere o saldo do produto selecionado.</p>
          </div>

          <div className="space-y-5">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Código do Produto</label>
              <input 
                type="text" 
                value={codProdPainel}
                onChange={(e) => setCodProdPainel(e.target.value)}
                placeholder="Selecione na tabela ao lado"
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-700 font-medium"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Quantidade</label>
              <input 
                type="number" 
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder="Ex: 10"
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-700"
              />
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <button 
                onClick={() => handleAcao('criar')}
                disabled={!!busy}
                className="w-full px-4 py-3 bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                Novo Registro
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleAcao('adicionar')}
                  disabled={!!busy}
                  className="w-full px-4 py-3 bg-[#4BAF47] hover:bg-[#3D943A] text-white font-medium rounded-xl transition-colors disabled:opacity-50 shadow-sm"
                >
                  + Adicionar
                </button>
                <button 
                  onClick={() => handleAcao('remover')}
                  disabled={!!busy}
                  className="w-full px-4 py-3 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  - Remover
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}