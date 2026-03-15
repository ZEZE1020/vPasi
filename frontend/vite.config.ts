import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use backend:8000 inside Docker, localhost:8000 for local dev
const apiTarget = process.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
})
