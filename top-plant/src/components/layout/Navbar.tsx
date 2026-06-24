import { useState, type Dispatch, type SetStateAction } from 'react'

// O tipo 'avarias' foi removido daqui
export type Section = 
  | 'inicio' 
  | 'cliente' | 'cliente-consulta' | 'cliente-excluir' 
  | 'produto' | 'produto-consulta' | 'produto-editar' 
  | 'pedido' | 'pedido-consulta' 
  

type NavbarProps = {
  setSection: Dispatch<SetStateAction<Section>>
}

export function Navbar({ setSection }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const goTo = (section: Section) => {
    setSection(section)
    setMobileMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/70 bg-white/85 backdrop-blur-xl shadow-[0_12px_40px_rgba(31,41,55,0.08)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
        <button
          type="button"
          onClick={() => {
            setSection('inicio')
            setMobileMenuOpen(false)
          }}
          className="flex items-center gap-3 self-start text-left text-2xl font-semibold tracking-tight text-[#2E7D32]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] text-lg shadow-sm">TP</span>
          <span>Top Plant</span>
        </button>

        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          <div className="group relative">
            <span className="inline-flex cursor-pointer items-center rounded-full border border-[#D9E1EA] bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-[#4BAF47] hover:text-[#2E7D32]">
              Clientes
            </span>
            <div className="absolute right-0 top-full z-50 hidden min-w-[220px] overflow-hidden rounded-2xl border border-[#D9E1EA] bg-white p-2 shadow-[0_24px_60px_rgba(31,41,55,0.12)] group-hover:block group-focus-within:block">
              <button onClick={() => goTo('cliente')} className="block w-full rounded-xl px-4 py-3 text-left text-sm text-gray-600 transition-colors hover:bg-[#F3F8F4] hover:text-[#2E7D32]">Cadastrar Cliente</button>
              <button onClick={() => goTo('cliente-consulta')} className="block w-full rounded-xl px-4 py-3 text-left text-sm text-gray-600 transition-colors hover:bg-[#F3F8F4] hover:text-[#2E7D32]">Consultar Clientes</button>
              <button onClick={() => goTo('cliente-excluir')} className="block w-full rounded-xl px-4 py-3 text-left text-sm text-[#C64A4A] transition-colors hover:bg-[#FFF1F1]">Área Restrita (Excluir)</button>
            </div>
          </div>

          <div className="group relative">
            <span className="inline-flex cursor-pointer items-center rounded-full border border-[#D9E1EA] bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-[#4BAF47] hover:text-[#2E7D32]">
              Produtos
            </span>
            <div className="absolute right-0 top-full z-50 hidden min-w-[220px] overflow-hidden rounded-2xl border border-[#D9E1EA] bg-white p-2 shadow-[0_24px_60px_rgba(31,41,55,0.12)] group-hover:block group-focus-within:block">
              <button onClick={() => goTo('produto')} className="block w-full rounded-xl px-4 py-3 text-left text-sm text-gray-600 transition-colors hover:bg-[#F3F8F4] hover:text-[#2E7D32]">Cadastrar Produto</button>
              <button onClick={() => goTo('produto-consulta')} className="block w-full rounded-xl px-4 py-3 text-left text-sm text-gray-600 transition-colors hover:bg-[#F3F8F4] hover:text-[#2E7D32]">Consultar Produtos</button>
              <button onClick={() => goTo('produto-editar')} className="block w-full rounded-xl px-4 py-3 text-left text-sm text-gray-600 transition-colors hover:bg-[#F3F8F4] hover:text-[#2E7D32]">Editar / Excluir</button>
            </div>
          </div>

          <div className="group relative">
            <span className="inline-flex cursor-pointer items-center rounded-full border border-[#D9E1EA] bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-[#4BAF47] hover:text-[#2E7D32]">
              Pedidos
            </span>
            <div className="absolute right-0 top-full z-50 hidden min-w-[220px] overflow-hidden rounded-2xl border border-[#D9E1EA] bg-white p-2 shadow-[0_24px_60px_rgba(31,41,55,0.12)] group-hover:block group-focus-within:block">
              <button onClick={() => goTo('pedido')} className="block w-full rounded-xl px-4 py-3 text-left text-sm text-gray-600 transition-colors hover:bg-[#F3F8F4] hover:text-[#2E7D32]">Registrar Pedido</button>
              <button onClick={() => goTo('pedido-consulta')} className="block w-full rounded-xl px-4 py-3 text-left text-sm text-gray-600 transition-colors hover:bg-[#F3F8F4] hover:text-[#2E7D32]">Consultar Pedidos</button>
            </div>
          </div>
        </div>

        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((value) => !value)}
            aria-expanded={mobileMenuOpen}
            aria-label="Abrir menu"
            className="ml-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#D9E1EA] bg-white text-[#2E7D32] shadow-sm transition-colors hover:border-[#4BAF47]"
          >
            <span className="sr-only">Menu</span>
            <span className="flex flex-col gap-1.5">
              <span className="h-0.5 w-5 rounded-full bg-current" />
              <span className="h-0.5 w-5 rounded-full bg-current" />
              <span className="h-0.5 w-5 rounded-full bg-current" />
            </span>
          </button>

          {mobileMenuOpen && (
            <div className="mt-4 grid gap-3 rounded-3xl border border-[#D9E1EA] bg-white p-4 shadow-[0_24px_60px_rgba(31,41,55,0.12)]">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#2E7D32]">Clientes</p>
                <div className="grid gap-2">
                  <button onClick={() => goTo('cliente')} className="rounded-2xl border border-[#D9E1EA] bg-[#F8FAF8] px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:border-[#4BAF47] hover:text-[#2E7D32]">Cadastrar Cliente</button>
                  <button onClick={() => goTo('cliente-consulta')} className="rounded-2xl border border-[#D9E1EA] bg-[#F8FAF8] px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:border-[#4BAF47] hover:text-[#2E7D32]">Consultar Clientes</button>
                  <button onClick={() => goTo('cliente-excluir')} className="rounded-2xl border border-[#F3C6C6] bg-[#FFF6F6] px-4 py-3 text-left text-sm text-[#C64A4A] transition-colors hover:border-[#C64A4A]">Área Restrita (Excluir)</button>
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#2E7D32]">Produtos</p>
                <div className="grid gap-2">
                  <button onClick={() => goTo('produto')} className="rounded-2xl border border-[#D9E1EA] bg-[#F8FAF8] px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:border-[#4BAF47] hover:text-[#2E7D32]">Cadastrar Produto</button>
                  <button onClick={() => goTo('produto-consulta')} className="rounded-2xl border border-[#D9E1EA] bg-[#F8FAF8] px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:border-[#4BAF47] hover:text-[#2E7D32]">Consultar Produtos</button>
                  <button onClick={() => goTo('produto-editar')} className="rounded-2xl border border-[#D9E1EA] bg-[#F8FAF8] px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:border-[#4BAF47] hover:text-[#2E7D32]">Editar / Excluir</button>
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#2E7D32]">Pedidos</p>
                <div className="grid gap-2">
                  <button onClick={() => goTo('pedido')} className="rounded-2xl border border-[#D9E1EA] bg-[#F8FAF8] px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:border-[#4BAF47] hover:text-[#2E7D32]">Registrar Pedido</button>
                  <button onClick={() => goTo('pedido-consulta')} className="rounded-2xl border border-[#D9E1EA] bg-[#F8FAF8] px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:border-[#4BAF47] hover:text-[#2E7D32]">Consultar Pedidos</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
