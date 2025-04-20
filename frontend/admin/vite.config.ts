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
    proxy: {
      '/api': {
        target: 'http://localhost:3000', 
        changeOrigin: true,
      },
    },
    port: 8000,
    strictPort: true,
    host: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    // css: {
    //   modules: {
    //     classNameStrategy: 'non-scoped',
    //   },
    // },
  },


})
