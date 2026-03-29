import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: './', // Tells Vite index.html is in the main folder
  build: {
    outDir: 'dist', // Tells Vite to create the 'dist' folder here
  }
})
