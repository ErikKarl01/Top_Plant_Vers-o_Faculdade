import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Toda vez que o React chamar /client ou /product, o Vite joga para o Django
      '/client': 'http://127.0.0.1:8000',
      '/product': 'http://127.0.0.1:8000',
      
      // Se você tiver rotas de pedidos, estoque, etc., adicione aqui também:
      // '/pedido': 'http://127.0.0.1:8000'
    }
  }
})