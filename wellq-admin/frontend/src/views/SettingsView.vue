<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold text-slate-dark">Configuración del Sistema</h2>
        <p class="text-sm text-slate-medium mt-0.5">Gestión de perfil y preferencias de la plataforma (EP-11)</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <div class="lg:col-span-1 space-y-6">
        <div class="card">
          <h3 class="text-sm font-semibold text-slate-dark mb-4">Tu Perfil (Super Admin)</h3>
          <div class="space-y-4">
            <div>
              <label class="text-xs text-slate-medium uppercase tracking-wider">Nombre</label>
              <p class="text-sm font-medium text-slate-dark">{{ authStore.user?.name }}</p>
            </div>
            <div>
              <label class="text-xs text-slate-medium uppercase tracking-wider">Email</label>
              <p class="text-sm font-medium text-slate-dark">{{ authStore.user?.email }}</p>
            </div>
            <div>
              <label class="text-xs text-slate-medium uppercase tracking-wider">Roles de Acceso</label>
              <div class="flex flex-wrap gap-1 mt-1">
                <span v-for="role in authStore.roles" :key="role" class="badge bg-indigo-light text-indigo">
                  {{ role }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-2 space-y-6">
        
        <div class="card">
          <h3 class="text-sm font-semibold text-slate-dark mb-4">Preferencias de Alertas Globales</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 border border-slate/10 rounded-lg bg-slate-light/50">
              <div>
                <p class="text-sm font-medium text-slate-dark">Alertas de Churn (Riesgo de Abandono)</p>
                <p class="text-xs text-slate-medium">Notificar cuando el Health Score de una clínica baje de 50.</p>
              </div>
              <input type="checkbox" checked class="w-4 h-4 text-indigo rounded border-slate/30">
            </div>
            <div class="flex items-center justify-between p-3 border border-slate/10 rounded-lg bg-slate-light/50">
              <div>
                <p class="text-sm font-medium text-slate-dark">Reporte Financiero Semanal</p>
                <p class="text-xs text-slate-medium">Recibir resumen de MRR y nuevas suscripciones por email.</p>
              </div>
              <input type="checkbox" class="w-4 h-4 text-indigo rounded border-slate/30">
            </div>
          </div>
        </div>

        <div class="card border-red/20 bg-red-light/30">
          <h3 class="text-sm font-semibold text-red mb-2">Zona de Peligro</h3>
          <p class="text-xs text-slate-medium mb-4">Acciones críticas de infraestructura. Estas acciones quedan registradas en el log de auditoría.</p>
          <button class="btn-danger text-xs" @click="limpiarCache">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Purgar Caché de Modelos IA
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'

// Conectamos con el estado global (Pinia) para sacar los datos del usuario "hackeado"
const authStore = useAuthStore()

// Función simulada para el botón de peligro
function limpiarCache() {
  if (confirm('¿Estás seguro de que deseas purgar la caché de los modelos de IA? Esto puede aumentar la latencia temporalmente.')) {
    alert('Simulación: Caché purgada exitosamente.')
  }
}
</script>

