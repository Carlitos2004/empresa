<template>
  <!-- Header superior de la aplicación -->
  <header class="h-14 bg-white border-b border-slate/10 flex items-center justify-between px-6 flex-shrink-0">

    <!-- Título de la sección activa (tomado de los meta del router) -->
    <h1 class="text-sm font-semibold text-slate-dark">
      {{ pageTitle }}
    </h1>

    <!-- Acciones del header: notificaciones y perfil -->
    <div class="flex items-center gap-3">

      <!-- Indicador de notificaciones pendientes -->
      <button class="relative p-2 rounded-lg text-slate hover:bg-slate-light transition-colors">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        <!-- Badge de conteo (solo visible si hay notificaciones) -->
        <span
          v-if="unreadCount > 0"
          class="absolute top-1 right-1 w-2 h-2 bg-red rounded-full"
        ></span>
      </button>

      <!-- Nombre del usuario autenticado -->
      <span class="text-xs text-slate-medium hidden sm:block">
        {{ authStore.user?.name }}
      </span>

    </div>
  </header>
</template>

<script setup>
/**
 * AppHeader.vue — Header superior
 * ================================
 * Muestra el título de la sección activa y acciones globales.
 */
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const authStore = useAuthStore()

// Título de la página actual desde los meta del router
const pageTitle = computed(() => route.meta?.title || 'WellQ Admin')

// Contador de notificaciones no leídas (en producción vendría de una store)
const unreadCount = ref(0)
</script>
