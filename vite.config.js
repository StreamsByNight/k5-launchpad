import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // We are removing the 'root' and 'path' complexity to let Vite 
  // find index.html in the default directory
  build: {
    outDir: 'dist',
  }
})
