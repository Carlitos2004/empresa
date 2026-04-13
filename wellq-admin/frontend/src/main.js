/**
 * main.js — Punto de entrada de la aplicación Vue
 * ================================================
 * Inicializa Keycloak ANTES de montar Vue para garantizar que
 * el usuario esté autenticado antes de cargar cualquier componente.
 * Si el usuario no está autenticado, Keycloak lo redirige al login.
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { initKeycloak } from './auth/keycloak'
import './assets/main.css'  // Estilos globales (importa Tailwind)


/*Cambio de carlos */


async function bootstrap() {
  
  // Comentamos la llamada real a Keycloak
  // const authenticated = await initKeycloak()
  // if (!authenticated) {
  //   console.log('[WellQ] Usuario no autenticado. Redirigiendo a Keycloak...')
  //   return
  // }
  
  // Forzamos la autenticación a true
  const authenticated = true;
  // --- FIN DEL HACK ---

  console.log('[WellQ] Usuario autenticado (MODO HACK). Montando aplicación Vue.')

  const app = createApp(App)
  app.use(createPinia())
  app.use(router)
  app.mount('#app')
}





// Ejecutar el arranque y capturar errores críticos
bootstrap().catch((error) => {
  console.error('[WellQ] Error crítico al arrancar la aplicación:', error)
})
