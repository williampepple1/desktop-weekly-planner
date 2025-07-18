import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  clearScreen: false,
  envPrefix: ['VITE_', 'TAURI_'],
  optimizeDeps: {
    exclude: ['@tauri-apps/api/tauri']
  },
  build: {
    rollupOptions: {
      external: ['@tauri-apps/api/tauri']
    }
  }
})
