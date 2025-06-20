import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
      hmr: {
        overlay: false // Disable error overlay for development
      }
    },
    define: {
      'import.meta.env.VITE_BACKEND_URL': JSON.stringify(env.VITE_BACKEND_URL)
    }
  }
})
