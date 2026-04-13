<template>
  <!-- Contenedor raíz de la aplicación -->
  <div class="min-h-screen flex bg-slate-light">

    <!-- Sidebar de navegación lateral -->
    <AppSidebar />

    <!-- Área de contenido principal -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">

      <!-- Header superior con título de sección y acciones globales -->
      <AppHeader />

      <!-- Contenido de la vista activa — Vue Router lo inyecta aquí -->
      <main class="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <!-- Transición suave al cambiar de vista -->
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>

    </div>

  </div>
</template>

<script setup>
/**
 * App.vue — Componente raíz
 * =========================
 * Monta el layout base de la aplicación (sidebar + header + contenido).
 * Al montarse, carga la información del usuario desde el token de Keycloak.
 */
import { onMounted } from 'vue'
import AppSidebar from './components/layout/AppSidebar.vue'
import AppHeader from './components/layout/AppHeader.vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

// Al montar la app, cargar la info del usuario desde el token de Keycloak
onMounted(() => {
  authStore.loadUserFromToken()
})
</script>

<style>
/* Transición de fade entre vistas */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
