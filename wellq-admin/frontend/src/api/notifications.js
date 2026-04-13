/**
 * api/notifications.js — Llamadas a la API de Notificaciones y Jobs
 * ==================================================================
 */

import apiClient from './client'

/** Envía una notificación a una o varias clínicas */
export const sendNotification = (data) =>
  apiClient.post('/api/notifications', data).then(r => r.data)

/** Lista notificaciones con filtros opcionales */
export const fetchNotifications = (params = {}) =>
  apiClient.get('/api/notifications', { params }).then(r => r.data)

/** Detalle de una notificación */
export const fetchNotification = (id) =>
  apiClient.get(`/api/notifications/${id}`).then(r => r.data)

/** Consulta el estado de un job asíncrono (polling) */
export const fetchJobStatus = (jobId) =>
  apiClient.get(`/api/jobs/${jobId}`).then(r => r.data)

/** Lanza una exportación de clínicas a CSV */
export const exportClinics = () =>
  apiClient.post('/api/jobs/export-clinics').then(r => r.data)
