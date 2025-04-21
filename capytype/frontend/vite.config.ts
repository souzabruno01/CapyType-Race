// CapyType - Vite Configuration
// This file configures the Vite development server for CapyType
// Project: Multiplayer Typing Game with Capybara Theme

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    hmr: {
      overlay: false // Disable error overlay for development
    }
  },
})
