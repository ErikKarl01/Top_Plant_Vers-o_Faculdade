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
    <div className="home-shell min-h-[calc(100vh-96px)] animate-fade-in">
      <section className="home-hero">
        <div className="home-hero-copy">
          <span className="home-badge">Top Plant</span>
          <h1>Sistema Interno</h1>
          <p>Selecione um módulo para começar</p>
        </div>

        <div className="home-hero-visual" aria-hidden="true">
          <div className="home-plant home-plant-left">
            <span className="home-leaf home-leaf-a" />
            <span className="home-leaf home-leaf-b" />
            <span className="home-stem" />
            <span className="home-pot" />
          </div>
          <div className="home-plant home-plant-center">
            <span className="home-leaf home-leaf-c" />
            <span className="home-leaf home-leaf-d" />
            <span className="home-stem home-stem-center" />
            <span className="home-pot home-pot-center" />
          </div>
          <div className="home-plant home-plant-right">
            <span className="home-leaf home-leaf-e" />
            <span className="home-leaf home-leaf-f" />
            <span className="home-stem home-stem-right" />
            <span className="home-pot" />
          </div>
        </div>
      </section>

      <section className="home-grid">
        {menuItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSection(item.id as Section)}
            className="home-card group"
          >
            <span className="home-card-pill">Abrir módulo</span>
            <h2>{item.title}</h2>
            <div>{item.subtitle}</div>
          </button>
        ))}
      </section>
    </div>
  )
}
