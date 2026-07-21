import type { NextConfig } from 'next'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

// This app lives in a subfolder of a repo that has its own lockfile. Pin the
// Turbopack root to this package so Next doesn't infer the parent as the root.
const nextConfig: NextConfig = {
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },
}

export default nextConfig
