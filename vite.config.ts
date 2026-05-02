import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'betterstep-brand-logo.png'],
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
          { src: 'betterstep-brand-logo.png', sizes: '1024x1024', type: 'image/png' },
          { src: 'betterstep-brand-logo.png', sizes: '1024x1024', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
})
