<template>
  <div class="space-y-6">

    <!-- Fila 1: Costos + Latencia de modelos -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">

      <!-- Panel de Costos de Infraestructura -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-slate-dark">Costos de Infraestructura</h3>
          <span v-if="costs" class="text-xs text-slate-medium">{{ costs.period }}</span>
        </div>

        <div v-if="loadingCosts" class="space-y-2">
          <div v-for="i in 4" :key="i" class="h-8 animate-pulse bg-slate/10 rounded"></div>
        </div>

        <template v-else-if="costs">
          <!-- Total vs Presupuesto -->
          <div class="flex justify-between items-end mb-4">
            <div>
              <p class="text-2xl font-bold text-slate-dark">${{ costs.totalUsd.toLocaleString() }}</p>
              <p class="text-xs text-slate-medium">de ${{ costs.budgetUsd.toLocaleString() }} presupuestados</p>
            </div>
            <span
              class="badge text-xs"
              :class="costs.budgetUsedPercent > 90 ? 'bg-red-light text-red' :
                      costs.budgetUsedPercent > 70 ? 'bg-amber-light text-amber' :
                      'bg-green-light text-green'"
            >
              {{ costs.budgetUsedPercent.toFixed(0) }}% usado
            </span>
          </div>
          <UtilizationBar :percent="costs.budgetUsedPercent" :show-label="false" />

          <!-- Desglose por categoría -->
          <div class="mt-4 space-y-2">
            <div
              v-for="item in costs.breakdown"
              :key="item.category"
              class="flex items-center justify-between text-sm"
            >
              <span class="text-slate text-xs">{{ item.category }}</span>
              <div class="flex items-center gap-3">
                <span class="text-xs text-slate-medium">{{ item.percentOfTotal.toFixed(0) }}%</span>
                <span class="font-medium text-slate-dark text-xs w-16 text-right">
                  ${{ item.amountUsd.toLocaleString() }}
                </span>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Panel de Análisis de Poses -->
      <div class="card">
        <h3 class="text-sm font-semibold text-slate-dark mb-4">Motor de Análisis de Poses</h3>

        <div v-if="loadingPose" class="space-y-2">
          <div v-for="i in 4" :key="i" class="h-8 animate-pulse bg-slate/10 rounded"></div>
        </div>

        <template v-else-if="poseStats">
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-slate-light rounded-lg p-3 text-center">
              <p class="text-2xl font-bold text-indigo">{{ poseStats.analysesToday.toLocaleString() }}</p>
              <p class="text-xs text-slate-medium">Análisis hoy</p>
            </div>
            <div class="bg-slate-light rounded-lg p-3 text-center">
              <p class="text-2xl font-bold text-slate-dark">{{ poseStats.analysesThisWeek.toLocaleString() }}</p>
              <p class="text-xs text-slate-medium">Esta semana</p>
            </div>
            <div class="bg-slate-light rounded-lg p-3 text-center">
              <p class="text-2xl font-bold text-green">{{ poseStats.accuracyPercent.toFixed(1) }}%</p>
              <p class="text-xs text-slate-medium">Precisión</p>
            </div>
            <div class="bg-slate-light rounded-lg p-3 text-center">
              <p class="text-2xl font-bold text-slate-dark">{{ poseStats.avgProcessingTimeMs.toFixed(0) }}ms</p>
              <p class="text-xs text-slate-medium">T. promedio</p>
            </div>
          </div>

          <div class="mt-4">
            <p class="text-xs text-slate-medium mb-2">Utilización GPU</p>
            <UtilizationBar :percent="poseStats.gpuUtilizationPercent" />
          </div>

          <div class="mt-3">
            <p class="text-xs text-slate-medium mb-1">Modelos activos</p>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="model in poseStats.modelsInUse"
                :key="model"
                class="badge bg-indigo-light text-indigo text-xs"
              >{{ model }}</span>
            </div>
          </div>
        </template>
      </div>

    </div>

    <!-- Fila 2: Latencia de modelos -->
    <div class="card p-0 overflow-hidden">
      <div class="px-5 py-4 border-b border-slate/10">
        <h3 class="text-sm font-semibold text-slate-dark">Latencia de Modelos IA (últimas 24h)</h3>
      </div>

      <div v-if="loadingLatency" class="p-4 space-y-2">
        <div v-for="i in 3" :key="i" class="h-8 animate-pulse bg-slate/10 rounded"></div>
      </div>

      <table v-else class="w-full text-sm">
        <thead class="bg-slate-light">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-medium">Modelo</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-medium">Estado</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-medium">p50</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-medium">p95</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-medium">p99</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-medium">Req/min</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-medium">Error %</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="model in latencyMetrics"
            :key="model.modelName"
            class="border-t border-slate/5"
          >
            <td class="px-4 py-3">
              <p class="font-medium text-slate-dark text-sm">{{ model.modelName }}</p>
              <p class="text-xs text-slate-medium">{{ model.version }}</p>
            </td>
            <td class="px-4 py-3"><StatusBadge :status="model.status" /></td>
            <td class="px-4 py-3 text-xs text-slate">{{ model.latencyMs.p50.toFixed(0) }}ms</td>
            <td class="px-4 py-3 text-xs text-slate">{{ model.latencyMs.p95.toFixed(0) }}ms</td>
            <td class="px-4 py-3 text-xs" :class="model.latencyMs.p99 > 500 ? 'text-red font-medium' : 'text-slate'">
              {{ model.latencyMs.p99.toFixed(0) }}ms
            </td>
            <td class="px-4 py-3 text-xs text-slate">{{ model.requestsPerMin.toFixed(1) }}</td>
            <td class="px-4 py-3 text-xs" :class="model.errorRate > 0.05 ? 'text-red font-medium' : 'text-slate'">
              {{ (model.errorRate * 100).toFixed(1) }}%
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Fila 3: Distribución de versiones de la app -->
    <div class="card p-0 overflow-hidden">
      <div class="px-5 py-4 border-b border-slate/10">
        <h3 class="text-sm font-semibold text-slate-dark">Distribución de Versiones de la App</h3>
      </div>
      <table class="w-full text-sm">
        <thead class="bg-slate-light">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-medium">Versión</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-medium">Plataforma</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-medium">Clínicas</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-medium">Distribución</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-medium">Soporte</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="v in appVersions"
            :key="`${v.version}-${v.platform}`"
            class="border-t border-slate/5"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <span class="font-mono text-sm font-medium text-slate-dark">{{ v.version }}</span>
                <span v-if="v.isLatest" class="badge bg-green-light text-green text-xs">Latest</span>
              </div>
            </td>
            <td class="px-4 py-3 text-xs text-slate">{{ v.platform }}</td>
            <td class="px-4 py-3 text-sm font-medium text-slate-dark">{{ v.clinicCount }}</td>
            <td class="px-4 py-3 w-40"><UtilizationBar :percent="v.percent" /></td>
            <td class="px-4 py-3">
              <span class="badge text-xs" :class="v.isSupported ? 'bg-green-light text-green' : 'bg-red-light text-red'">
                {{ v.isSupported ? 'Soportada' : 'EOL' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup>
/**
 * PlatformOpsView.vue — Vista de Operaciones de Plataforma
 * =========================================================
 * Muestra costos, análisis de poses, latencia de modelos IA
 * y distribución de versiones de la app móvil.
 */
import { ref, onMounted } from 'vue'
import {
  fetchInfrastructureCosts,
  fetchModelLatency,
  fetchPoseAnalysisStats,
  fetchAppVersionDistribution,
} from '../api/platform'
import StatusBadge from '../components/shared/StatusBadge.vue'
import UtilizationBar from '../components/shared/UtilizationBar.vue'

// Estado local para los datos de cada panel
const costs          = ref(null)
const poseStats      = ref(null)
const latencyMetrics = ref([])
const appVersions    = ref([])

// Indicadores de carga por panel
const loadingCosts   = ref(true)
const loadingPose    = ref(true)
const loadingLatency = ref(true)

// Cargar todos los datos en paralelo al montar la vista
onMounted(async () => {
  await Promise.allSettled([
    fetchInfrastructureCosts().then(d => { costs.value = d }).finally(() => loadingCosts.value = false),
    fetchPoseAnalysisStats().then(d => { poseStats.value = d }).finally(() => loadingPose.value = false),
    fetchModelLatency(24).then(d => { latencyMetrics.value = d }).finally(() => loadingLatency.value = false),
    fetchAppVersionDistribution().then(d => { appVersions.value = d }),
  ])
})
</script>
