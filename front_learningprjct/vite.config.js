import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // ✅ AÑADIR: Estrategia de generación del SW
      strategies: 'generateSW', // Genera automáticamente el Service Worker
      // ✅ AÑADIR: Configuración del manifest para desarrollo
      devOptions: {
        enabled: true, // Habilitar PWA en desarrollo
        type: 'module',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg}'],
        globIgnores: ['**/arrow-left*.js'],
        navigateFallback: null,
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/translate\.google\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'google-translate',
            },
          },
        ]
      },
      includeAssets: ['Corporatives/Typography/Rondana Regular.otf', 'vite.svg'],
      manifest: {
        name: 'Campus Evenor - Soluciones Tecnológicas',
        short_name: 'Campus Evenor',
        description: 'Soluciones tecnológicas innovadoras para el uso sostenible y la protección de suelos',
        theme_color: '#a1db87',
        background_color: '#222222',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait-primary',
        categories: ['technology', 'science', 'environment'],
        icons: [
          {
            src: 'vite.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Inicio',
            short_name: 'Inicio',
            description: 'Campus Evenor - Soluciones Tecnológicas',
            url: '/',
            icons: [{ src: '/pwa-icons/icon-96x96.png', sizes: '96x96' }]
          },
          {
            name: 'Contacto',
            short_name: 'Contacto',
            description: 'Contactar con Campus Evenor - Soluciones Tecnológicas',
            url: '/contacto',
            icons: [{ src: '/pwa-icons/icon-96x96.png', sizes: '96x96' }]
          }
        ]
      }
    })
  ],
})