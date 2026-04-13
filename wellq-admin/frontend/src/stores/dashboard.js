/**
 * stores/dashboard.js — Store del Dashboard Overview (Pinia)
 * ============================================================
 * Gestiona los datos de ambas pestañas del dashboard:
 * - Business Health: KPIs, MRR, churn heatmap, needs attention
 * - Operational Status: servidores, procesos, uso de la app
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as dashboardApi from '../api/dashboard'

export const useDashboardStore = defineStore('dashboard', () => {
  // ── Estado: Business Health ───────────────────────────────────────────────
  const kpis = ref(null)             // 6 KPI cards
  const mrrChart = ref(null)         // Datos del gráfico MRR
  const needsAttention = ref([])     // Lista de items que requieren atención
  const activeTab = ref('health')    // Pestaña activa: 'health' | 'operational'

  // ── Estado: Operational Status ────────────────────────────────────────────
  const operationalStatus = ref(null)  // Servidores, procesos, uso de app

  // ── Estado de carga ────────────────────────────────────────────────────────
  const isLoadingKPIs = ref(false)
  const isLoadingMRR = ref(false)
  const isLoadingOperational = ref(false)

  // ── Acciones ─────────────────────────────────────────────────────────────

  /**
   * Carga todos los datos de la pestaña Business Health en paralelo.
   * Usar Promise.all para minimizar el tiempo de carga total.
   */
  async function loadBusinessHealth() {
    isLoadingKPIs.value = true
    isLoadingMRR.value = true

    try {
      // Cargar KPIs, gráfico MRR y alertas en paralelo
      const [kpisData, mrrData, attentionData] = await Promise.all([
        dashboardApi.fetchHealthKPIs(),
        dashboardApi.fetchMRRChart(12),
        dashboardApi.fetchNeedsAttention(),
      ])

      kpis.value = kpisData
      mrrChart.value = mrrData
      needsAttention.value = attentionData

    } catch (err) {
      console.error('[Dashboard Store] Error al cargar Business Health:', err)
    } finally {
      isLoadingKPIs.value = false
      isLoadingMRR.value = false
    }
  }

  /**
   * Carga los datos de la pestaña Operational Status.
   */
  async function loadOperationalStatus() {
    isLoadingOperational.value = true

    try {
      operationalStatus.value = await dashboardApi.fetchOperationalStatus()
    } catch (err) {
      console.error('[Dashboard Store] Error al cargar estado operativo:', err)
    } finally {
      isLoadingOperational.value = false
    }
  }

  /**
   * Cambia la pestaña activa y carga los datos correspondientes si aún no los tenemos.
   * @param {'health'|'operational'} tab
   */
  async function switchTab(tab) {
    activeTab.value = tab
    if (tab === 'health' && !kpis.value) {
      await loadBusinessHealth()
    }
    if (tab === 'operational' && !operationalStatus.value) {
      await loadOperationalStatus()
    }
  }

  return {
    // Estado
    kpis, mrrChart, needsAttention, activeTab, operationalStatus,
    isLoadingKPIs, isLoadingMRR, isLoadingOperational,
    // Acciones
    loadBusinessHealth, loadOperationalStatus, switchTab,
  }
})
