import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { createHash } from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Each file in public/uploads by its content fingerprint, as
// virtual:upload-versions ({ "/uploads/a.jpg": "1a2b3c4d" }); photo.js puts it on
// the address, so a replaced photo is fetched once and an unchanged one never.
function uploadVersions() {
  const id = 'virtual:upload-versions'
  const dir = path.resolve(__dirname, 'public/uploads')
  return {
    name: 'upload-versions',
    resolveId: (source) => (source === id ? String.fromCharCode(0) + id : null),
    load(resolved) {
      if (resolved !== String.fromCharCode(0) + id) return null
      const out = {}
      for (const name of fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
        const file = path.join(dir, name)
        if (fs.statSync(file).isFile()) out[`/uploads/${name}`] = createHash('sha1').update(fs.readFileSync(file)).digest('hex').slice(0, 8)
      }
      return `export default ${JSON.stringify(out)}`
    },
  }
}

export default defineConfig(({ command }) => {
  const isProduction = command === 'build'

  return {
    plugins: [
      react(),
      uploadVersions(),
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
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
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
