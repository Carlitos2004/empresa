/**
 * stores/auth.js — Store de Autenticación (Pinia)
 * =================================================
 * Gestiona el estado del usuario autenticado en toda la aplicación.
 * Se popula al arrancar la app desde los claims del token de Keycloak.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getUserInfo, getUserRoles, logout as keycloakLogout } from '../auth/keycloak'

export const useAuthStore = defineStore('auth', () => {
  // ── Estado ──────────────────────────────────────────────────────────────────
  const user = ref(null)      // Información del usuario (sub, email, name)
  const roles = ref([])       // Roles del usuario en Keycloak

  // ── Computed ─────────────────────────────────────────────────────────────────
  /** Indica si el usuario está autenticado */
  const isAuthenticated = computed(() => user.value !== null)

  /** Indica si el usuario tiene rol de administrador */
  const isAdmin = computed(() =>
    roles.value.includes('wellq-admin') || roles.value.includes('wellq-super-admin')
  )

  /** Indica si el usuario tiene rol de super-administrador */
  const isSuperAdmin = computed(() =>
    roles.value.includes('wellq-super-admin')
  )




  // ── Acciones ─────────────────────────────────────────────────────────────────



/* Cambio carlos
 */

function loadUserFromToken() {
    // --- INICIO DEL HACK ---
    // Inyectamos un usuario falso en lugar de leer el token
    user.value = {
      sub:   'dev-hack-123',
      email: 'estudiante@alloxentric.com',
      name:  'Modo Desarrollador Local',
    }
    // Le damos el rol máximo para que el router no nos bloquee ninguna pantalla
    roles.value = ['wellq-admin', 'wellq-super-admin']

    console.log('[Auth Store] HACK ACTIVADO: Usuario falso cargado:', user.value.email)
    // --- FIN DEL HACK ---
  }











  /**
   * Cierra la sesión del usuario.
   * Limpia el estado local y redirige al logout de Keycloak.
   */
  async function logout() {
    user.value = null
    roles.value = []
    await keycloakLogout()
  }

  return {
    // Estado
    user,
    roles,
    // Computed
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    // Acciones
    loadUserFromToken,
    logout,
  }
})
