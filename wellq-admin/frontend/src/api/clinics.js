/**
 * api/clinics.js — Llamadas a la API de Gestión de Clínicas
 * ===========================================================
 */

import apiClient from './client'

/**
 * Lista clínicas con filtros y paginación.
 * @param {object} params - Filtros: search, tier, status, page, pageSize, sortBy, sortOrder
 * @returns {Promise<ClinicListResponse>}
 */
export const fetchClinics = (params = {}) =>
  apiClient.get('/api/clinics', { params }).then(r => r.data)

/**
 * Obtiene el detalle completo de una clínica.
 * @param {string} clinicId
 * @returns {Promise<ClinicDetail>}
 */
export const fetchClinic = (clinicId) =>
  apiClient.get(`/api/clinics/${clinicId}`).then(r => r.data)

/**
 * Actualiza campos de una clínica (PATCH).
 * @param {string} clinicId
 * @param {object} updates - Campos a actualizar: tier, status, patientsLimit, notes
 * @returns {Promise<ClinicDetail>}
 */
export const updateClinic = (clinicId, updates) =>
  apiClient.patch(`/api/clinics/${clinicId}`, updates).then(r => r.data)

/**
 * Inicia una sesión de impersonación en una clínica.
 * @param {string} clinicId
 * @param {string} reason - Motivo (obligatorio para auditoría)
 * @returns {Promise<ImpersonateResponse>}
 */
export const impersonateClinic = (clinicId, reason) =>
  apiClient.post(`/api/clinics/${clinicId}/impersonate`, { reason }).then(r => r.data)
