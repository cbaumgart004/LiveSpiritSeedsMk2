import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'

export default defineConfig(({ command }) => {
  const isProduction = command === 'build'

  return {
    plugins: [
      react(),
      ...(isProduction
        ? [
            viteCompression({
              algorithm: 'brotliCompress',
              ext: '.br',
              threshold: 0,
            }),
            viteCompression({
              algorithm: 'gzip',
              ext: '.gz',
              threshold: 0,
            }),
          ]
        : []),
    ],
    build: {
      minify: 'esbuild',
      target: 'esnext',
      assetsInlineLimit: 0,
      sourcemap: true,
    },
    server: {
      port: 5173,
      host: true, // 🧭 allows mobile/LAN access (e.g. 192.168.1.x)
      strictPort: false,
      headers: isProduction
        ? {
            'Cache-Control': 'public, max-age=31536000, immutable',
          }
        : {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
    },
    clearScreen: false,
  }
})
