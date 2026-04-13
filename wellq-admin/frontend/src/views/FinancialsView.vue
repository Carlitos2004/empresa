<template>
  <div class="space-y-6">

    <!-- Cabecera de la sección con acciones -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold text-slate-dark">Finanzas</h2>
        <p class="text-sm text-slate-medium mt-0.5">
          Resumen de facturación, ingresos y suscripciones activas.
        </p>
      </div>
      <!-- Botón de exportación con job asíncrono -->
      <button
        @click="exportToCSV"
        :disabled="isExporting"
        class="btn-secondary text-xs"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        </svg>
        {{ isExporting ? 'Exportando...' : 'Exportar CSV' }}
      </button>
    </div>

    <!-- Mensaje de placeholder para la sección en desarrollo -->
    <div class="card text-center py-16">
      <div class="text-4xl mb-4">💰</div>
      <h3 class="text-base font-semibold text-slate-dark mb-2">Módulo de Finanzas</h3>
      <p class="text-sm text-slate-medium max-w-md mx-auto">
        Aquí se mostrarán las facturas, el historial de pagos, las renovaciones
        de suscripción y los reportes de ingresos por clínica y tier.
        Esta sección se completa en el Épico EP-03 del plan de desarrollo.
      </p>

      <!-- Estado del job de exportación -->
      <div v-if="exportJob" class="mt-6 p-4 bg-indigo-light rounded-lg max-w-sm mx-auto text-left">
        <p class="text-xs font-semibold text-indigo mb-2">Estado de la exportación</p>
        <p class="text-xs text-slate">Job ID: <code class="font-mono">{{ exportJob.id }}</code></p>
        <p class="text-xs text-slate mt-1">
          Estado: <span class="font-medium capitalize">{{ exportJob.status }}</span>
        </p>
        <div class="mt-2">
          <UtilizationBar :percent="exportJob.progress" />
        </div>
        <a
          v-if="exportJob.resultUrl"
          :href="exportJob.resultUrl"
          class="mt-2 block text-xs text-indigo hover:underline"
        >
          📥 Descargar CSV
        </a>
      </div>
    </div>

  </div>
</template>

<script setup>
/**
 * FinancialsView.vue — Vista de Finanzas
 * =======================================
 * Sección de facturación y finanzas. Muestra un placeholder por ahora
 * con funcionalidad de exportación de datos a CSV vía job asíncrono.
 */
import { ref } from 'vue'
import { exportClinics, fetchJobStatus } from '../api/notifications'
import UtilizationBar from '../components/shared/UtilizationBar.vue'

const isExporting = ref(false)
const exportJob   = ref(null)

/**
 * Lanza un job de exportación y hace polling hasta que termine.
 * El polling se detiene cuando el job termina (completed/failed).
 */
async function exportToCSV() {
  if (isExporting.value) return
  isExporting.value = true

  try {
    // Lanzar el job de exportación en el backend
    exportJob.value = await exportClinics()

    // Hacer polling cada 2 segundos hasta que el job termine
    const poll = setInterval(async () => {
      try {
        const status = await fetchJobStatus(exportJob.value.id)
        exportJob.value = status

        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(poll)
          isExporting.value = false
        }
      } catch {
        clearInterval(poll)
        isExporting.value = false
      }
    }, 2000)

  } catch (err) {
    console.error('Error al exportar:', err)
    isExporting.value = false
  }
}
</script>
