import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Add these critical settings:
  base: './', // Relative paths for static deployment
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './index.html' // Explicit entry point
      }
    }
  },
  server: {
    open: true // Auto-open browser on dev
  }
});