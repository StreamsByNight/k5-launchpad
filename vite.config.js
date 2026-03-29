import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: './', // Confirms index.html is in the main folder
  base: './', // Helps with path resolution on Render
  build: {
    outDir: 'dist',
    emptyOutDir: true, // Clears the folder before building
    rollupOptions: {
      input: './index.html', // Explicitly tells Vite where the entry is
    },
  },
})
