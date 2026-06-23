import type { Section } from '../../components/layout/Navbar'

type HomeProps = {
  setSection: (section: Section) => void
}

export function Home({ setSection }: HomeProps) {
  // Avarias removido da lista
  const menuItems: { id: Section; title: string; subtitle: string }[] = [
    { id: 'cliente', title: 'Clientes', subtitle: 'Cadastro e gestão' },
    { id: 'produto', title: 'Produtos', subtitle: 'Catálogo de produtos' },
    { id: 'pedido', title: 'Pedidos', subtitle: 'Registrar pedidos' },
  ]

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 flex flex-col items-center justify-center p-6 animate-fade-in">
      
      <div className="text-center mb-12">
        <img 
          src="/src/assets/logo.png" 
          alt="Top Plant Logo" 
          className="h-24 mx-auto mb-6 drop-shadow-sm object-contain"
        />
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          Sistema Interno
        </h1>
        <p className="text-gray-500 mt-2">Selecione um módulo para começar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl w-full">
        {menuItems.map((item) => (
          <div 
            key={item.id}
            onClick={() => setSection(item.id as Section)}
            className="bg-white rounded-2xl p-6 text-center cursor-pointer border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-[#4BAF47] transition-all duration-300 group"
          >
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-[#4BAF47] transition-colors">
              {item.title}
            </h2>
            <div className="text-sm text-gray-500 mt-2">
              {item.subtitle}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}