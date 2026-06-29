import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Workshop Tracker',
        short_name: 'Workshop',
        description: 'Manage your workshop appointments and customers offline',
        theme_color: '#2563eb',
        background_color: '#f8fafc',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: './public/icons.svg',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: './public/icons.svg',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: './public/icons.svg',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
            }
          },
          {
            urlPattern: /^https:\/\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
            }
          }
        ]
      }
    })
  ]
})