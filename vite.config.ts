import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'betterstep-brand-logo.png', 'betterstep-app-icon.png'],
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,vtt}'],
        globIgnores: ['**/*.mp4'],
      },
      manifest: {
        name: 'BetterStep by Dr. Hewage',
        short_name: 'BetterStep',
        description: 'GP-supervised weight management companion',
        theme_color: '#1B3D34',
        background_color: '#F6F3EE',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'betterstep-brand-logo.png', sizes: '192x192', type: 'image/png' },
          { src: 'betterstep-brand-logo.png', sizes: '512x512', type: 'image/png' },
          { src: 'betterstep-brand-logo.png', sizes: '1024x1024', type: 'image/png' },
          { src: 'betterstep-brand-logo.png', sizes: '1024x1024', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
})
