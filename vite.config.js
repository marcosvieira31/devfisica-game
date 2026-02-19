import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Diz pro Vite: "Tudo que for rota de API, joga pro servidor na 3000"
      '/auth': 'http://localhost:3000',
      '/login': 'http://localhost:3000',
      '/carregar-avatar': 'http://localhost:3000',
      '/salvar-avatar': 'http://localhost:3000',
      '/ganhar-pontos': 'http://localhost:3000',
      '/comprar-item': 'http://localhost:3000',
      '/ranking': 'http://localhost:3000',
      '/admin': 'http://localhost:3000',
      '/treino': 'http://localhost:3000',
      '/materiais': 'http://localhost:3000',
      '/links': 'http://localhost:3000',
    }
  }
})
