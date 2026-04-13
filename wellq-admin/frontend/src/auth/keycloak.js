/**
 * auth/keycloak.js — Integración con Keycloak en el frontend
 * ===========================================================
 * Inicializa el adaptador de Keycloak (keycloak-js) y gestiona
 * el ciclo de vida del token: obtención, renovación automática
 * y cierre de sesión.
 *
 * Todos los demás módulos deben usar las funciones de este archivo
 * en lugar de acceder directamente a la instancia de Keycloak.
 */

import Keycloak from 'keycloak-js'

// ── Instancia de Keycloak (singleton) ────────────────────────────────────────
// Se configura con las variables de entorno del .env.local
const keycloak = new Keycloak({
  url:      import.meta.env.VITE_KEYCLOAK_URL,      // URL del servidor Keycloak
  realm:    import.meta.env.VITE_KEYCLOAK_REALM,    // Realm (ej. "wellq")
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID, // Client ID público del frontend
})

// Intervalo de renovación de token (en milisegundos)
let tokenRefreshInterval = null

/**
 * Inicializa Keycloak e intenta autenticar al usuario.
 *
 * Usa el flujo `check-sso` para detectar si hay una sesión activa
 * sin redirigir al usuario si no la hay.
 *
 * Si no hay sesión, llama a `login()` para redirigir a Keycloak.
 *
 * @returns {Promise<boolean>} true si el usuario está autenticado
 */
export async function initKeycloak() {
  try {
    // `check-sso` verifica la sesión en un iframe silencioso antes de redirigir
    const authenticated = await keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      pkceMethod: 'S256',    // PKCE es obligatorio para clients públicos
      checkLoginIframe: false, // Desactivar iframe de Keycloak (evita problemas de CSP)
    })

    if (!authenticated) {
      // No hay sesión activa — redirigir al login de Keycloak
      await keycloak.login()
      return false
    }

    // Configurar renovación automática del token antes de que expire
    _setupTokenRefresh()

    console.log('[Keycloak] Autenticado como:', keycloak.tokenParsed?.email)
    return true

  } catch (error) {
    console.error('[Keycloak] Error al inicializar:', error)
    throw error
  }
}

/**
 * Configura un intervalo que renueva el token 60 segundos antes de que expire.
 * Keycloak tiene un `tokenParsed.exp` con el timestamp de expiración.
 */
function _setupTokenRefresh() {
  // Limpiar intervalo anterior si existe
  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval)
  }

  // Verificar cada 30 segundos si el token expira en menos de 60 segundos
  tokenRefreshInterval = setInterval(async () => {
    try {
      // updateToken(60) renueva el token si expira en menos de 60 segundos
      // Retorna true si renovó, false si aún era válido
      const refreshed = await keycloak.updateToken(60)
      if (refreshed) {
        console.log('[Keycloak] Token renovado automáticamente.')
      }
    } catch (error) {
      console.error('[Keycloak] No se pudo renovar el token. Redirigiendo al login.', error)
      clearInterval(tokenRefreshInterval)
      await keycloak.login()
    }
  }, 30_000)  // Cada 30 segundos
}

/**
 * Retorna el token JWT actual (Bearer token).
 * Se usa para incluirlo en el header Authorization de cada request.
 *
 * @returns {string|undefined} Token JWT o undefined si no está autenticado
 */
export function getToken() {
  return keycloak.token
}

/**
 * Retorna la información del usuario decodificada del token.
 * @returns {object} Claims del token (sub, email, name, realm_access, etc.)
 */
export function getUserInfo() {
  return keycloak.tokenParsed || {}
}

/**
 * Retorna los roles del usuario desde el token.
 * Combina roles del realm y del cliente.
 * @returns {string[]} Lista de roles
 */
export function getUserRoles() {
  const realmRoles = keycloak.tokenParsed?.realm_access?.roles || []
  const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID
  const clientRoles = keycloak.tokenParsed?.resource_access?.[clientId]?.roles || []
  return [...new Set([...realmRoles, ...clientRoles])]
}

/**
 * Cierra la sesión del usuario redirigiendo al endpoint de logout de Keycloak.
 * También limpia el intervalo de renovación de token.
 */
export async function logout() {
  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval)
  }
  await keycloak.logout({
    redirectUri: window.location.origin, // Redirigir al home después del logout
  })
}
