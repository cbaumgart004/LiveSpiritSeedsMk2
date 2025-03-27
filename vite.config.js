import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    viteCompression({ algorithm: 'brotliCompress', ext: '.br', threshold: 0 }),
    viteCompression({ algorithm: 'gzip', ext: '.gz', threshold: 0 }),
  ],
  build: {
    minify: 'esbuild',
    target: 'esnext',
    assetsInlineLimit: 0,
  },
  server: {
    headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
  },
})
