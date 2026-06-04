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
  base: "/ECM-JiraMini/",
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
