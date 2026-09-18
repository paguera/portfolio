import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5174,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@tiptap')) {
            return 'editor';
          }
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
            return 'react-core';
          }
        },
      },
    },
  },
})
