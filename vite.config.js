import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/medmind-frontend/', // QUAN TRỌNG: Để GitHub Pages load đúng link
})
