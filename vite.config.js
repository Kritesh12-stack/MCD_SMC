import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Avoid node_modules/.vite — Windows often blocks rmdir there (EPERM).
  cacheDir: '.vite',
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://3.109.15.146',
        changeOrigin: true,
      },
    },
  },
})
