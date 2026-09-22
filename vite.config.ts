import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// BASE_PATH lets the same build serve from a user page ("/") or a project
// page ("/<repo>/"). The GitHub Actions workflow sets it automatically.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  build: { outDir: 'dist', assetsInlineLimit: 0 },
})
