/**
 * api/dashboard.js — Llamadas a la API del Dashboard
 * ====================================================
 * Funciones que llaman a los endpoints del backend relacionados
 * con el dashboard Overview (Business Health y Operational Status).
 */

import apiClient from './client'

/**
 * Obtiene los 6 KPIs de salud del negocio.
 * @returns {Promise<BusinessHealthKPIs>}
 */
export const fetchHealthKPIs = () =>
  apiClient.get('/api/dashboard/health/kpis').then(r => r.data)

/**
 * Obtiene los datos para el gráfico de MRR.
 * @param {number} months - Número de meses a incluir (1-24)
 * @returns {Promise<MRRChartResponse>}
 */
export const fetchMRRChart = (months = 12) =>
  apiClient.get('/api/dashboard/health/mrr-chart', { params: { months } }).then(r => r.data)

/**
 * Obtiene la lista de clínicas/eventos que necesitan atención.
 * @returns {Promise<NeedsAttentionItem[]>}
 */
export const fetchNeedsAttention = () =>
  apiClient.get('/api/dashboard/health/needs-attention').then(r => r.data)

/**
 * Obtiene el estado operativo (servidores, procesos, uso de la app).
 * @returns {Promise<OperationalStatusResponse>}
 */
export const fetchOperationalStatus = () =>
  apiClient.get('/api/dashboard/operational').then(r => r.data)
