import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

const UI_VENDOR =
  /^(react|react-dom|scheduler|zustand|use-sync-external-store|@radix-ui\/.*|@floating-ui\/.*|react-remove-scroll.*|aria-hidden|use-callback-ref|use-sidecar|get-nonce|detect-node-es|tslib|lucide-react|clsx|tailwind-merge)$/

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
  build: {
    rollupOptions: {
      output: {
        // The UI's own deps get a vendor chunk; three and everything the 3D
        // stack pulls in load only with the scene. Without the explicit
        // vendor chunk rollup folds react into the 3D chunks and the entry
        // ends up preloading all of them.
        manualChunks(id) {
          if (id.includes('vite/preload-helper')) return 'vendor'
          const m = id.match(/\/node_modules\/((?:@[^/]+\/)?[^/]+)/)
          if (!m) return
          const pkg = m[1]
          if (pkg === 'three') return 'three'
          if (UI_VENDOR.test(pkg)) return 'vendor'
          return 'r3f'
        },
      },
    },
  },
})
