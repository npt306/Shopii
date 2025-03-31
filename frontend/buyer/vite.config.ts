import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  preview: {
    port: 8000,
    strictPort: true,
  },
  server: {
    port: 8000,
    strictPort: true,
    host: true,
  },
})
