<template>
  <!-- Sidebar fija de navegación principal -->
  <aside class="w-56 flex-shrink-0 bg-slate-dark flex flex-col h-screen sticky top-0">

    <!-- Logo y nombre de la app -->
    <div class="px-5 py-5 border-b border-white/10">
      <div class="flex items-center gap-3">
        <!-- Icono de la marca WellQ -->
        <div class="w-8 h-8 bg-indigo rounded-lg flex items-center justify-center flex-shrink-0">
          <span class="text-white font-bold text-sm">W</span>
        </div>
        <div>
          <p class="text-white font-semibold text-sm leading-tight">WellQ</p>
          <p class="text-slate-medium text-xs">Admin Console</p>
        </div>
      </div>
    </div>

    <!-- Items de navegación -->
    <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.to"
        class="nav-item"
        :class="{ 'nav-item--active': isActive(item.to) }"
      >
        <!-- Ícono SVG inline (sin dependencias externas) -->
        <span class="w-4 h-4 flex-shrink-0" v-html="item.icon"></span>
        <span class="text-sm">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <!-- Footer del sidebar: info del usuario y logout -->
    <div class="px-3 py-4 border-t border-white/10">
      <div class="flex items-center gap-3 px-2 py-2">
        <!-- Avatar del usuario (iniciales) -->
        <div class="w-7 h-7 bg-indigo rounded-full flex items-center justify-center flex-shrink-0">
          <span class="text-white text-xs font-bold">{{ userInitials }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-white text-xs font-medium truncate">{{ authStore.user?.name }}</p>
          <p class="text-slate-medium text-xs truncate">{{ authStore.user?.email }}</p>
        </div>
      </div>
      <!-- Botón de cerrar sesión -->
      <button
        @click="authStore.logout"
        class="w-full mt-1 flex items-center gap-2 px-2 py-2 rounded-lg
               text-slate-medium hover:text-white hover:bg-white/5
               text-xs transition-colors duration-150"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
        Cerrar sesión
      </button>
    </div>

  </aside>
</template>

<script setup>
/**
 * AppSidebar.vue — Barra de navegación lateral
 * =============================================
 * Muestra los items de navegación del wireframe y resalta el activo.
 * Incluye el perfil del usuario y el botón de logout al final.
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const authStore = useAuthStore()

/** Determina si un path es la ruta activa actual */
const isActive = (path) => route.path.startsWith(path)

/** Iniciales del usuario para el avatar */
const userInitials = computed(() => {
  const name = authStore.user?.name || ''
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'A'
})

/** Items del menú de navegación con sus iconos SVG */
const navItems = [
  {
    name: 'overview',
    label: 'Overview',
    to: '/overview',
    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>`,
  },
  {
    name: 'clinics',
    label: 'Clinic Management',
    to: '/clinics',
    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16M3 21h18M9 21V9h6v12"/>
    </svg>`,
  },
  {
    name: 'financials',
    label: 'Financials',
    to: '/financials',
    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
    </svg>`,
  },
  {
    name: 'platform',
    label: 'Platform Ops',
    to: '/platform',
    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
    </svg>`,
  },
  {
    name: 'analytics',
    label: 'Product Analytics',
    to: '/analytics',
    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path d="M3 17l5-5 4 4 9-9"/>
    </svg>`,
  },
  {
    name: 'settings',
    label: 'Settings',
    to: '/settings',
    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>`,
  },
]
</script>

<style scoped>
/* Item de navegación base */
.nav-item {
  @apply flex items-center gap-3 px-3 py-2.5 rounded-lg
         text-slate-medium hover:text-white hover:bg-white/5
         transition-colors duration-150 cursor-pointer;
}
/* Estado activo — resaltado en índigo */
.nav-item--active {
  @apply bg-indigo/20 text-white;
}
</style>
