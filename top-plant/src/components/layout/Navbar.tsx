import type { Dispatch, SetStateAction } from 'react'

// O tipo 'avarias' foi removido daqui
export type Section = 
  | 'inicio' 
  | 'cliente' | 'cliente-consulta' | 'cliente-excluir' 
  | 'produto' | 'produto-consulta' | 'produto-editar' 
  | 'pedido' | 'pedido-consulta' 
  | 'estoque' 

type NavbarProps = {
  setSection: Dispatch<SetStateAction<Section>>
}

export function Navbar({ setSection }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center shadow-md sticky top-0 z-50">
      {/* Logo */}
      <div 
        className="ext-figma-green text-xl font-bold text-xl font-bold cursor-pointer flex items-center gap-3" 
        onClick={() => setSection('inicio')}
      >
        <span className="tracking-wide">Top Plant</span>
      </div>

      {/* Menu de Navegação */}
      <div className="hidden md:flex gap-6 items-center">
        
        {/* Dropdown: Clientes */}
        <div className="relative group cursor-pointer">
          <span className="text-gray-600 hover:text-figma-green font-semibold py-2 hover:text-white transition-colors">
            Clientes ▼
          </span>
          <div className="absolute hidden group-hover:block top-full right-0 bg-white border border-gray-100 shadow-lg rounded-xl overflow-hidden min-w-[200px] shadow-xl mt-2 border border-gray-800">
            <button onClick={() => setSection('cliente')} className="w-full text-left block text-gray-600 hover:text-figma-green px-4 py-3 hover:bg-[#5C162B] transition-colors text-sm">
              Cadastrar Cliente
            </button>
            <button onClick={() => setSection('cliente-consulta')} className="w-full text-left block text-gray-600 hover:text-figma-green px-4 py-3 hover:bg-[#5C162B] transition-colors text-sm">
              Consultar Clientes
            </button>
            <button onClick={() => setSection('cliente-excluir')} className="w-full text-left block text-[#f87171] px-4 py-3 hover:bg-[#5C162B] transition-colors text-sm">
              Área Restrita (Excluir)
            </button>
          </div>
        </div>

        {/* Dropdown: Produtos */}
        <div className="relative group cursor-pointer">
          <span className="text-gray-600 hover:text-figma-green font-semibold py-2 hover:text-white transition-colors">
            Produtos ▼
          </span>
          <div className="absolute hidden group-hover:block top-full right-0 bg-white border border-gray-100 shadow-lg rounded-xl overflow-hidden min-w-[200px] shadow-xl mt-2 border border-gray-800">
            <button onClick={() => setSection('produto')} className="w-full text-left block text-gray-600 hover:text-figma-green px-4 py-3 hover:bg-[#5C162B] transition-colors text-sm">
              Cadastrar Produto
            </button>
            <button onClick={() => setSection('produto-consulta')} className="w-full text-left block text-gray-600 hover:text-figma-green px-4 py-3 hover:bg-[#5C162B] transition-colors text-sm">
              Consultar Produtos
            </button>
            <button onClick={() => setSection('produto-editar')} className="w-full text-left block text-gray-600 hover:text-figma-green px-4 py-3 hover:bg-[#5C162B] transition-colors text-sm">
              Editar / Excluir
            </button>
          </div>
        </div>

        {/* Dropdown: Pedidos */}
        <div className="relative group cursor-pointer">
          <span className="text-gray-600 hover:text-figma-green font-semibold py-2 hover:text-white transition-colors">
            Pedidos ▼
          </span>
          <div className="absolute hidden group-hover:block top-full right-0 bg-white border border-gray-100 shadow-lg rounded-xl overflow-hidden min-w-[200px] shadow-xl mt-2 border border-gray-800">
            <button onClick={() => setSection('pedido')} className="w-full text-left block text-gray-600 hover:text-figma-green px-4 py-3 hover:bg-[#5C162B] transition-colors text-sm">
              Registrar Pedido
            </button>
            <button onClick={() => setSection('pedido-consulta')} className="w-full text-left block text-gray-600 hover:text-figma-green px-4 py-3 hover:bg-[#5C162B] transition-colors text-sm">
              Consultar Pedidos
            </button>
          </div>
        </div>

        {/* Links Diretos - Avarias removido daqui */}
        <button onClick={() => setSection('estoque')} className="text-gray-600 hover:text-figma-green font-semibold hover:text-white transition-colors">
          Estoque
        </button>

      </div>
    </nav>
  )
}