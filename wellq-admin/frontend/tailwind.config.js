/**
 * tailwind.config.js — Configuración de Tailwind CSS
 * ===================================================
 * Extiende el tema base de Tailwind con los colores y tokens
 * de diseño del wireframe WellQ Admin Console.
 */

/** @type {import('tailwindcss').Config} */
export default {
  // Rutas de archivos donde Tailwind buscará clases usadas (para purge en producción)
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],

  theme: {
    extend: {
      // ── Paleta de colores del sistema de diseño WellQ ─────────────────────
      colors: {
        // Indigo — color principal (sidebar, botones primarios, badges activos)
        indigo: {
          DEFAULT: '#4F46E5',
          dark:    '#3730A3',
          light:   '#EEF2FF',
        },
        // Slate — textos, fondos neutros, bordes
        slate: {
          DEFAULT: '#475569',
          dark:    '#1E293B',
          medium:  '#94A3B8',
          light:   '#F8FAFC',
        },
        // Green — éxito, estado healthy, tendencias positivas
        green: {
          DEFAULT: '#059669',
          light:   '#ECFDF5',
        },
        // Amber — alertas warning
        amber: {
          DEFAULT: '#D97706',
          light:   '#FFFBEB',
        },
        // Red — errores, estado critical, churn
        red: {
          DEFAULT: '#DC2626',
          light:   '#FEF2F2',
        },
      },

      // ── Fuentes ────────────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      // ── Sombras personalizadas ─────────────────────────────────────────────
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        drawer: '-4px 0 24px 0 rgb(0 0 0 / 0.12)',
      },
    },
  },

  plugins: [
    // Plugin oficial de Tailwind para estilos de formularios (inputs, selects, etc.)
    require('@tailwindcss/forms'),
  ],
}
