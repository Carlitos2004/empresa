/**
 * api/client.js — Cliente HTTP centralizado (Axios)
 * ===================================================
 * Configura una instancia de Axios compartida por todos los módulos de API.
 * El interceptor de request añade automáticamente el token de Keycloak
 * al header Authorization de cada llamada.
 * El interceptor de response maneja errores globales (401, 403, 500, etc.).
 */

import axios from 'axios'
import { getToken } from '../auth/keycloak'
import { useAuthStore } from '../stores/auth'

// Crear instancia de Axios con la URL base del backend configurada en .env
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 15_000,  // Timeout de 15 segundos por request
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// ── Interceptor de REQUEST ────────────────────────────────────────────────────
// Se ejecuta antes de enviar cada request: añade el token JWT de Keycloak.
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      // Añadir el token al header Authorization en formato Bearer
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    // Error al preparar el request (muy raro, ej. JSON inválido)
    console.error('[API] Error al preparar el request:', error)
    return Promise.reject(error)
  }
)

// ── Interceptor de RESPONSE ───────────────────────────────────────────────────
// Se ejecuta después de recibir cada respuesta: maneja errores globales.
apiClient.interceptors.response.use(
  // Respuesta exitosa (2xx) — la retornamos tal cual
  (response) => response,

  // Respuesta con error (4xx, 5xx)
  async (error) => {
    const status = error.response?.status
    const detail = error.response?.data?.detail || 'Error desconocido'

    if (status === 401) {
      // Token expirado o inválido — el usuario debe volver a autenticarse
      console.warn('[API] 401 Unauthorized. El token puede haber expirado.')
      // En producción, aquí se puede llamar a keycloak.login() para re-autenticar
    }

    if (status === 403) {
      // El usuario no tiene permisos para esta operación
      console.warn('[API] 403 Forbidden:', detail)
    }

    if (status === 500) {
      // Error interno del servidor — loggear para debugging
      console.error('[API] 500 Error del servidor:', detail)
    }

    // Rechazar la promesa con el error para que cada llamada pueda manejarlo
    return Promise.reject({
      status,
      message: detail,
      raw: error,
    })
  }
)

export default apiClient
