import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3007', // Puerto backend Express
        changeOrigin: true,
      },
    },
  },
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
      includeAssets: ['Corporatives/Images/Logo/Logo.png', 'Corporatives/Typography/Rondana Regular.otf', 'pwa-icons/*.png'],
      manifest: {
        name: 'Campus Evenor - Soluciones Tecnológicas',
        short_name: 'Campus Evenor - Soluciones Tecnológicas',
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
            src: 'pwa-icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: 'pwa-icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: 'pwa-icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'pwa-icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: 'pwa-icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: 'pwa-icons/manifest-icon-192.maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-icons/manifest-icon-192.maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'pwa-icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'pwa-icons/manifest-icon-512.maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-icons/manifest-icon-512.maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
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