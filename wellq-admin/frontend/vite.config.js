/**
 * vite.config.js — Configuración de Vite para el frontend WellQ Admin
 * =====================================================================
 * Vite es el bundler/dev-server del proyecto. Sus ventajas clave:
 * - HMR (Hot Module Replacement) instantáneo durante desarrollo
 * - Compilación optimizada con Rollup para producción
 * - Soporte nativo para ES Modules
 */

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    // Plugin oficial de Vue 3 para Vite — habilita la compilación de .vue SFC
    vue(),
  ],

  resolve: {
    alias: {
      // El alias '@' apunta a src/ para facilitar imports absolutos
      // Ejemplo: import KPICard from '@/components/shared/KPICard.vue'
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    port: 5173,  // Puerto del dev server (debe coincidir con ALLOWED_ORIGINS del backend)

    // Proxy para redirigir las llamadas /api/* al backend FastAPI en desarrollo.
    // Esto evita problemas de CORS durante el desarrollo sin configurar el backend.
    proxy: {
      '/api': {
        target: 'http://localhost:8000',  // URL del backend FastAPI
        changeOrigin: true,               // Cambiar el header Host al del target
        secure: false,                    // No verificar SSL en desarrollo
      },
    },
  },

  build: {
    // Generar sourcemaps para facilitar el debugging de la build de producción
    sourcemap: true,
    // Directorio de salida de la build
    outDir: 'dist',
    rollupOptions: {
      output: {
        // Dividir el bundle en chunks por vendor para mejor caché en el navegador
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-charts': ['chart.js', 'vue-chartjs'],
          'vendor-keycloak': ['keycloak-js'],
        },
      },
    },
  },
})
