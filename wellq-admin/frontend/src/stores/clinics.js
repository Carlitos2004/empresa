/**
 * stores/clinics.js — Store de Gestión de Clínicas (Pinia)
 * ==========================================================
 * Centraliza el estado de la lista de clínicas, los filtros activos
 * y la clínica seleccionada en el drawer. Todas las operaciones
 * asíncronas (cargar lista, actualizar clínica) se disparan desde aquí.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as clinicsApi from '../api/clinics'

export const useClinicsStore = defineStore('clinics', () => {
  // ── Estado ──────────────────────────────────────────────────────────────────
  const clinics = ref([])          // Lista de clínicas de la página actual
  const total = ref(0)             // Total de clínicas que coinciden con el filtro
  const selectedClinic = ref(null) // Clínica seleccionada para el drawer lateral
  const isLoading = ref(false)     // Indica si hay una petición en curso
  const isDrawerOpen = ref(false)  // Controla la visibilidad del drawer
  const error = ref(null)          // Mensaje de error de la última operación

  // ── Filtros y paginación ───────────────────────────────────────────────────
  const filters = ref({
    search: '',
    tier: null,
    status: null,
    page: 1,
    pageSize: 20,
    sortBy: 'name',
    sortOrder: 'asc',
  })

  // ── Computed ─────────────────────────────────────────────────────────────────
  const totalPages = computed(() => Math.ceil(total.value / filters.value.pageSize))
  const hasResults = computed(() => clinics.value.length > 0)

  // ── Acciones ─────────────────────────────────────────────────────────────────

  /**
   * Carga la lista de clínicas con los filtros actuales.
   * Resetea el error y activa el indicador de carga.
   */
  async function loadClinics() {
    isLoading.value = true
    error.value = null

    try {
      const response = await clinicsApi.fetchClinics(filters.value)
      clinics.value = response.data
      total.value = response.total
    } catch (err) {
      error.value = err.message || 'Error al cargar clínicas'
      console.error('[Clinics Store] Error al cargar:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Abre el drawer con el detalle de la clínica seleccionada.
   * Carga el detalle completo si no lo tenemos aún.
   * @param {string} clinicId
   */
  async function openDrawer(clinicId) {
    isDrawerOpen.value = true
    selectedClinic.value = null  // Mostrar skeleton mientras carga

    try {
      selectedClinic.value = await clinicsApi.fetchClinic(clinicId)
    } catch (err) {
      console.error('[Clinics Store] Error al cargar detalle:', err)
      isDrawerOpen.value = false
    }
  }

  /** Cierra el drawer lateral */
  function closeDrawer() {
    isDrawerOpen.value = false
    selectedClinic.value = null
  }

  /**
   * Actualiza campos de una clínica y refresca la lista.
   * @param {string} clinicId
   * @param {object} updates
   */
  async function updateClinic(clinicId, updates) {
    try {
      const updated = await clinicsApi.updateClinic(clinicId, updates)

      // Actualizar la clínica en la lista local sin recargar todo
      const idx = clinics.value.findIndex(c => c.id === clinicId)
      if (idx !== -1) {
        clinics.value[idx] = { ...clinics.value[idx], ...updated }
      }

      // Si el drawer está abierto con esta clínica, actualizarlo también
      if (selectedClinic.value?.id === clinicId) {
        selectedClinic.value = updated
      }

      return updated
    } catch (err) {
      console.error('[Clinics Store] Error al actualizar:', err)
      throw err
    }
  }

  /**
   * Aplica un filtro y recarga la lista desde la página 1.
   * @param {object} newFilters - Campos del filtro a actualizar
   */
  function applyFilter(newFilters) {
    filters.value = { ...filters.value, ...newFilters, page: 1 }
    loadClinics()
  }

  /** Cambia a una página específica */
  function goToPage(page) {
    filters.value.page = page
    loadClinics()
  }

  return {
    // Estado
    clinics, total, selectedClinic, isLoading, isDrawerOpen, error, filters,
    // Computed
    totalPages, hasResults,
    // Acciones
    loadClinics, openDrawer, closeDrawer, updateClinic, applyFilter, goToPage,
  }
})
