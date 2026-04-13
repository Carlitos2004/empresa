// postcss.config.js — Configuración de PostCSS
// Procesa el CSS de Tailwind y aplica autoprefixer para compatibilidad entre navegadores.
export default {
  plugins: {
    tailwindcss: {},   // Genera las clases de Tailwind
    autoprefixer: {},  // Añade prefijos de vendor (-webkit-, -moz-, etc.) automáticamente
  },
}
