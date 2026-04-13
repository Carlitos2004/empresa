/**
 * api/platform.js — Llamadas a la API de Platform Ops
 * =====================================================
 */

import apiClient from './client'

/** Costos de infraestructura del mes actual */
export const fetchInfrastructureCosts = () =>
  apiClient.get('/api/platform/costs').then(r => r.data)

/** Métricas de latencia de modelos IA
 * @param {number} hours - Ventana de tiempo en horas (default 24)
 */
export const fetchModelLatency = (hours = 24) =>
  apiClient.get('/api/platform/latency', { params: { hours } }).then(r => r.data)

/** Estadísticas del motor de análisis de poses */
export const fetchPoseAnalysisStats = () =>
  apiClient.get('/api/platform/pose-analysis').then(r => r.data)

/** Distribución de versiones de la app móvil por clínica */
export const fetchAppVersionDistribution = () =>
  apiClient.get('/api/platform/app-versions').then(r => r.data)
