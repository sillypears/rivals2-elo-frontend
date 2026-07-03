import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/r2lb-proxy': {
        target: 'http://192.168.1.30:8010',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/r2lb-proxy/, ''),
      },
    },
  },
})
