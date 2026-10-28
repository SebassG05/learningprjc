import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import routeModulePreload from './vite/routeModulePreload.js'
import notFoundStatus from './vite/notFoundStatus.js'

export default defineConfig(({ mode }) => {
  // VITE_API_URL del .env (process.env no lo trae en la config): lo usa la precarga de datos de la ficha
  const env = loadEnv(mode, process.cwd(), '')
  return {
  base: '/',
  plugins: [
    react(),
    // Rutas que la SPA no conoce: index.html con estado 404 (no un soft 404)
    notFoundStatus(),
    // Entrada directa por URL a rutas con lazy(): su chunk (y en la ficha, los datos del curso)
    // bajan en paralelo con el bundle principal
    routeModulePreload(
      [
        [/^\/cursos\/?$/, 'src/pages/Cursos.jsx'],
        [/^\/curso\/([a-f0-9]{24})\/inscripcion\/?$/i, 'src/pages/CursoInscripcion.jsx', '/api/courses/$1'],
        // Páginas fuera del bundle inicial (lib/lazyRoute.js): el primer render espera a su chunk
        [/^\/contacto\/?$/, 'src/pages/Contacto.jsx'],
        [/^\/rese(ñ|%C3%B1)as\/?$/i, 'src/pages/Reviews.jsx'],
        [/^\/ajustes\/?$/, 'src/pages/Ajustes.jsx'],
        [/^\/login\/?$/, 'src/pages/Login.jsx'],
        [/^\/(politica-)?cookies\/?$/, 'src/pages/PoliticaCookies.jsx'],
        [/^\/guia-usuario\/?$/, 'src/pages/GuiaUsuario.jsx'],
        [/^\/privacidad\/?$/, 'src/pages/Privacidad.jsx'],
        [/^\/terminos\/?$/, 'src/pages/TerminosUso.jsx'],
        [/^\/aviso-legal\/?$/, 'src/pages/AvisoLegal.jsx'],
      ],
      { apiBase: env.VITE_API_URL || 'http://localhost:8547' }
    ),
    VitePWA({
      registerType: 'autoUpdate',
      // El registro del service worker no bloquea el primer pintado (antes era un <script> síncrono en <head>)
      injectRegister: 'script-defer',
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
}
})
