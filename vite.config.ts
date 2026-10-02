import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // No Replit o Preview chega por um proxy com domínio próprio (*.replit.dev): o Vite precisa
    // escutar fora do localhost e aceitar esse Host, senão responde "Blocked request". Só vale
    // para o servidor de desenvolvimento; o build de produção não usa esta seção.
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
