import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // The Express API (server/index.ts) runs on 3001 during development.
    proxy: { '/api': 'http://localhost:3001' },
  },
})
