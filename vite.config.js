import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        // In local dev, proxy /api to Express backend on port 5000
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    define: {
      // VITE_API_URL overrides the API base in production builds.
      // When deploying to Firebase Hosting, leave VITE_API_URL empty —
      // the hosting rewrite forwards /api/** to the Cloud Function automatically.
      // Only set VITE_API_URL if using a separate backend (Render, etc.)
      __API_BASE__: JSON.stringify(env.VITE_API_URL || '')
    }
  }
})
