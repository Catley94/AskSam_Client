import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,         // Enables external access
    strictPort: true,   // Prevents automatic port changes
    port: 5173,         // Explicit port declaration
    watch: {
      usePolling: true  // Essential for Docker file watching
    }
  }
})
