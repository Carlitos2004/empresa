/**
 * router/index.js — Configuración de Vue Router
 * ===============================================
 * Define todas las rutas de la aplicación y aplica guardias de navegación
 * para verificar autenticación antes de acceder a rutas protegidas.
 */

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Lazy loading de vistas: cada vista se carga solo cuando se navega a ella
// Esto reduce el bundle inicial y mejora el tiempo de carga.
const OverviewView      = () => import('../views/OverviewView.vue')
const ClinicsView       = () => import('../views/ClinicsView.vue')
const FinancialsView    = () => import('../views/FinancialsView.vue')
const PlatformOpsView   = () => import('../views/PlatformOpsView.vue')
const AnalyticsView     = () => import('../views/AnalyticsView.vue')
const SettingsView      = () => import('../views/SettingsView.vue')
const NotFoundView      = () => import('../views/NotFoundView.vue')

const routes = [
  {
    path: '/',
    redirect: '/overview',  // Redirigir la raíz al dashboard
  },
  {
    path: '/overview',
    name: 'overview',
    component: OverviewView,
    meta: {
      title: 'Overview',
      requiresAuth: true,
      icon: 'grid',
    },
  },
  {
    path: '/clinics',
    name: 'clinics',
    component: ClinicsView,
    meta: {
      title: 'Clinic Management',
      requiresAuth: true,
      icon: 'building',
    },
  },
  {
    path: '/financials',
    name: 'financials',
    component: FinancialsView,
    meta: {
      title: 'Financials',
      requiresAuth: true,
      icon: 'chart-bar',
    },
  },
  {
    path: '/platform',
    name: 'platform',
    component: PlatformOpsView,
    meta: {
      title: 'Platform Ops',
      requiresAuth: true,
      icon: 'server',
    },
  },
  {
    path: '/analytics',
    name: 'analytics',
    component: AnalyticsView,
    meta: {
      title: 'Product Analytics',
      requiresAuth: true,
      icon: 'trending-up',
    },
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
    meta: {
      title: 'Settings',
      requiresAuth: true,
      icon: 'settings',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: { title: 'Página no encontrada' },
  },
]

const router = createRouter({
  // Usar el historial de HTML5 (URLs limpias sin #)
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // Hacer scroll al top en cada navegación
  scrollBehavior: () => ({ top: 0 }),
})

// ── Guardia de navegación global ─────────────────────────────────────────────
// Se ejecuta antes de cada cambio de ruta.
router.beforeEach(async (to, from, next) => {
  // Actualizar el título de la pestaña del navegador
  document.title = to.meta.title ? `${to.meta.title} — WellQ Admin` : 'WellQ Admin'

  // Si la ruta no requiere autenticación, continuar directamente
  if (!to.meta.requiresAuth) {
    return next()
  }

  // Verificar que el usuario está autenticado (la store lo sabe por el token de Keycloak)
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) {
    // La autenticación se maneja en main.js con Keycloak; este guard es una red de seguridad
    return next({ name: 'overview' })
  }

  next()
})

export default router
