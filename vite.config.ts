import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  css: {
    devSourcemap: true
  },
  base: "/ECM-frontend-engineering-training/",
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
