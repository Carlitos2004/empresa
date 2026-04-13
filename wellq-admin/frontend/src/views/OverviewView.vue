<template>
  <div class="space-y-6">

    <!-- Pestañas: Business Health / Operational Status -->
    <div class="flex gap-1 bg-slate-light p-1 rounded-xl w-fit">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="store.switchTab(tab.id)"
        class="px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150"
        :class="store.activeTab === tab.id
          ? 'bg-white text-slate-dark shadow-sm'
          : 'text-slate-medium hover:text-slate'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- ═══════════════════ PESTAÑA: BUSINESS HEALTH ═══════════════════ -->
    <template v-if="store.activeTab === 'health'">

      <!-- Grid de 6 KPI Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <!-- Skeleton mientras cargan los KPIs -->
        <div
          v-if="store.isLoadingKPIs"
          v-for="i in 6" :key="`kpi-sk-${i}`"
          class="card h-28 animate-pulse bg-slate/5"
        ></div>

        <!-- KPI Cards reales -->
        <template v-else-if="store.kpis">
          <KPICard v-bind="store.kpis.mrrTotal"          />
          <KPICard v-bind="store.kpis.activeClinics"     />
          <KPICard v-bind="store.kpis.churnRate"         />
          <KPICard v-bind="store.kpis.avgHealthScore"    />
          <KPICard v-bind="store.kpis.outstandingInvoices" />
          <KPICard v-bind="store.kpis.newSignups"        />
        </template>
      </div>

      <!-- Segunda fila: Gráfico MRR + Needs Attention -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Gráfico MRR (2/3 del ancho) -->
        <div class="xl:col-span-2">
          <div v-if="store.isLoadingMRR" class="card h-72 animate-pulse bg-slate/5"></div>
          <MRRChart v-else :chart-data="store.mrrChart" />
        </div>

        <!-- Panel Needs Attention (1/3 del ancho) -->
        <NeedsAttention :items="store.needsAttention" />
      </div>

    </template>

    <!-- ═══════════════════ PESTAÑA: OPERATIONAL STATUS ═══════════════ -->
    <template v-if="store.activeTab === 'operational'">

      <!-- Skeleton mientras carga -->
      <div v-if="store.isLoadingOperational" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="i in 4" :key="`op-sk-${i}`" class="card h-24 animate-pulse bg-slate/5"></div>
      </div>

      <template v-else-if="store.operationalStatus">

        <!-- Métricas de uso de la app -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="card text-center">
            <p class="text-2xl font-bold text-indigo">
              {{ store.operationalStatus.appUsage.activeSessions }}
            </p>
            <p class="text-xs text-slate-medium mt-1">Sesiones Activas</p>
          </div>
          <div class="card text-center">
            <p class="text-2xl font-bold text-slate-dark">
              {{ store.operationalStatus.appUsage.dailyActiveUsers }}
            </p>
            <p class="text-xs text-slate-medium mt-1">Usuarios Hoy</p>
          </div>
          <div class="card text-center">
            <p class="text-2xl font-bold text-slate-dark">
              {{ store.operationalStatus.appUsage.avgSessionDurationMin.toFixed(1) }}m
            </p>
            <p class="text-xs text-slate-medium mt-1">Sesión Promedio</p>
          </div>
          <div class="card text-center">
            <p class="text-2xl font-bold text-slate-dark">
              {{ store.operationalStatus.appUsage.apiRequestsPerMin.toFixed(0) }}
            </p>
            <p class="text-xs text-slate-medium mt-1">Req/min API</p>
          </div>
        </div>

        <!-- Tabla de servidores -->
        <div class="card p-0 overflow-hidden">
          <div class="px-5 py-4 border-b border-slate/10">
            <h3 class="text-sm font-semibold text-slate-dark">Servidores</h3>
          </div>
          <table class="w-full text-sm">
            <thead class="bg-slate-light">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-medium">Servidor</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-medium">Estado</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-medium">CPU</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-medium">Memoria</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-medium">Uptime</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="server in store.operationalStatus.servers"
                :key="server.name"
                class="border-t border-slate/5"
              >
                <td class="px-4 py-3">
                  <p class="font-medium text-slate-dark text-sm">{{ server.name }}</p>
                  <p class="text-xs text-slate-medium">{{ server.region }}</p>
                </td>
                <td class="px-4 py-3"><StatusBadge :status="server.status" /></td>
                <td class="px-4 py-3 w-32"><UtilizationBar :percent="server.cpuPercent" /></td>
                <td class="px-4 py-3 w-32"><UtilizationBar :percent="server.memoryPercent" /></td>
                <td class="px-4 py-3 text-xs text-slate-medium">{{ server.uptimeHours.toFixed(0) }}h</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Tabla de procesos -->
        <div class="card p-0 overflow-hidden">
          <div class="px-5 py-4 border-b border-slate/10">
            <h3 class="text-sm font-semibold text-slate-dark">Procesos del Sistema</h3>
          </div>
          <table class="w-full text-sm">
            <thead class="bg-slate-light">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-medium">Proceso</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-medium">Estado</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-medium">Instancias</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-medium">Error Rate</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-medium">Latencia P95</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="proc in store.operationalStatus.processes"
                :key="proc.name"
                class="border-t border-slate/5"
              >
                <td class="px-4 py-3 font-medium text-slate-dark text-sm">{{ proc.name }}</td>
                <td class="px-4 py-3"><StatusBadge :status="proc.status" /></td>
                <td class="px-4 py-3 text-sm text-slate">{{ proc.instances }}</td>
                <td class="px-4 py-3 text-sm" :class="proc.errorRate > 0.05 ? 'text-red font-medium' : 'text-slate'">
                  {{ (proc.errorRate * 100).toFixed(1) }}%
                </td>
                <td class="px-4 py-3 text-sm text-slate">{{ proc.avgLatencyMs.toFixed(0) }}ms</td>
              </tr>
            </tbody>
          </table>
        </div>

      </template>
    </template>

  </div>
</template>

<script setup>
/**
 * OverviewView.vue — Vista del Dashboard Overview
 * =================================================
 * Muestra las dos pestañas del dashboard: Business Health y Operational Status.
 * Al montarse, carga automáticamente los datos de la pestaña activa.
 */
import { onMounted } from 'vue'
import { useDashboardStore } from '../stores/dashboard'
import KPICard from '../components/shared/KPICard.vue'
import MRRChart from '../components/dashboard/MRRChart.vue'
import NeedsAttention from '../components/dashboard/NeedsAttention.vue'
import StatusBadge from '../components/shared/StatusBadge.vue'
import UtilizationBar from '../components/shared/UtilizationBar.vue'

const store = useDashboardStore()

const tabs = [
  { id: 'health',      label: 'Business Health' },
  { id: 'operational', label: 'Operational Status' },
]

// Al montar la vista, cargar los datos de la pestaña activa por defecto
onMounted(() => {
  store.loadBusinessHealth()
})
</script>
