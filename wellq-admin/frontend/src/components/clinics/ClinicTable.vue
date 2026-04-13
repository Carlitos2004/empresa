<template>
  <div class="card p-0 overflow-hidden">

    <!-- Barra de filtros -->
    <div class="px-5 py-4 border-b border-slate/10 flex flex-wrap gap-3 items-center">

      <!-- Búsqueda por nombre -->
      <div class="relative flex-1 min-w-48">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-medium"
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
        </svg>
        <input
          v-model="searchInput"
          type="text"
          placeholder="Buscar clínica..."
          class="input-base pl-9 h-9 text-xs"
          @input="onSearch"
        />
      </div>

      <!-- Filtro por Tier -->
      <select
        v-model="tierFilter"
        class="input-base h-9 text-xs w-36"
        @change="onFilter"
      >
        <option value="">Todos los tiers</option>
        <option value="Starter">Starter</option>
        <option value="Growth">Growth</option>
        <option value="Enterprise">Enterprise</option>
      </select>

      <!-- Filtro por Estado -->
      <select
        v-model="statusFilter"
        class="input-base h-9 text-xs w-36"
        @change="onFilter"
      >
        <option value="">Todos los estados</option>
        <option value="active">Active</option>
        <option value="warning">Warning</option>
        <option value="critical">Critical</option>
        <option value="churned">Churned</option>
      </select>

      <!-- Contador de resultados -->
      <span class="text-xs text-slate-medium ml-auto">
        {{ store.total }} clínicas
      </span>

    </div>

    <!-- Tabla -->
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate/10 bg-slate-light">
            <th
              v-for="col in columns"
              :key="col.key"
              class="px-4 py-3 text-left text-xs font-semibold text-slate-medium uppercase tracking-wide cursor-pointer hover:text-slate-dark"
              @click="onSort(col.key)"
            >
              <div class="flex items-center gap-1">
                {{ col.label }}
                <!-- Indicador de ordenamiento activo -->
                <span v-if="store.filters.sortBy === col.key" class="text-indigo">
                  {{ store.filters.sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- Estado vacío -->
          <tr v-if="!store.isLoading && !store.hasResults">
            <td :colspan="columns.length" class="px-4 py-12 text-center text-slate-medium text-sm">
              No se encontraron clínicas con los filtros aplicados.
            </td>
          </tr>

          <!-- Skeleton de carga -->
          <tr v-if="store.isLoading" v-for="i in 5" :key="`sk-${i}`">
            <td v-for="col in columns" :key="col.key" class="px-4 py-3">
              <div class="h-4 bg-slate/10 rounded animate-pulse"></div>
            </td>
          </tr>

          <!-- Filas de clínicas -->
          <ClinicRow
            v-for="clinic in store.clinics"
            :key="clinic.id"
            :clinic="clinic"
            @click="store.openDrawer(clinic.id)"
          />
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div class="px-5 py-3 border-t border-slate/10 flex items-center justify-between">
      <span class="text-xs text-slate-medium">
        Página {{ store.filters.page }} de {{ store.totalPages }}
      </span>
      <div class="flex gap-2">
        <button
          :disabled="store.filters.page <= 1"
          @click="store.goToPage(store.filters.page - 1)"
          class="btn-secondary py-1 px-3 text-xs disabled:opacity-40"
        >Anterior</button>
        <button
          :disabled="store.filters.page >= store.totalPages"
          @click="store.goToPage(store.filters.page + 1)"
          class="btn-secondary py-1 px-3 text-xs disabled:opacity-40"
        >Siguiente</button>
      </div>
    </div>

  </div>
</template>

<script setup>
/**
 * ClinicTable.vue — Tabla principal de gestión de clínicas
 * =========================================================
 * Muestra la lista paginada de clínicas con filtros, búsqueda y ordenamiento.
 * Al hacer clic en una fila, abre el ClinicDrawer con el detalle.
 */
import { ref } from 'vue'
import { useClinicsStore } from '../../stores/clinics'
import ClinicRow from './ClinicRow.vue'

const store = useClinicsStore()

// Valores locales de los filtros (sincronizados con la store)
const searchInput = ref(store.filters.search || '')
const tierFilter   = ref(store.filters.tier || '')
const statusFilter = ref(store.filters.status || '')

// Columnas de la tabla
const columns = [
  { key: 'name',           label: 'Clínica' },
  { key: 'tier',           label: 'Tier' },
  { key: 'status',         label: 'Estado' },
  { key: 'patientsUsed',   label: 'Pacientes' },
  { key: 'healthScore',    label: 'Health' },
  { key: 'mrr',            label: 'MRR' },
  { key: 'lastLogin',      label: 'Último Login' },
]

// Debounce para la búsqueda: esperar 300ms después del último carácter tecleado
let searchTimeout = null
function onSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    store.applyFilter({ search: searchInput.value })
  }, 300)
}

// Aplicar filtros de select inmediatamente
function onFilter() {
  store.applyFilter({
    tier:   tierFilter.value || null,
    status: statusFilter.value || null,
  })
}

// Cambiar el campo de ordenamiento (alterna asc/desc si ya está activo)
function onSort(key) {
  const currentOrder = store.filters.sortOrder
  store.applyFilter({
    sortBy: key,
    sortOrder: store.filters.sortBy === key
      ? (currentOrder === 'asc' ? 'desc' : 'asc')
      : 'asc',
  })
}
</script>
