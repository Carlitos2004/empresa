<template>
  <!-- Fila de la tabla de clínicas — clickeable para abrir el drawer -->
  <tr
    class="border-b border-slate/5 hover:bg-slate-light/60 cursor-pointer transition-colors duration-100"
    @click="$emit('click')"
  >
    <!-- Nombre de la clínica -->
    <td class="px-4 py-3">
      <div class="flex flex-col">
        <span class="font-medium text-slate-dark text-sm">{{ clinic.name }}</span>
        <span v-if="clinic.location" class="text-xs text-slate-medium">{{ clinic.location }}</span>
      </div>
    </td>

    <!-- Tier / Plan -->
    <td class="px-4 py-3">
      <span class="badge text-xs" :class="tierClass">{{ clinic.tier }}</span>
    </td>

    <!-- Estado -->
    <td class="px-4 py-3">
      <StatusBadge :status="clinic.status" />
    </td>

    <!-- Uso de pacientes con barra de progreso -->
    <td class="px-4 py-3 w-40">
      <div class="flex flex-col gap-1">
        <span class="text-xs text-slate-medium">
          {{ clinic.patientsUsed }} / {{ clinic.patientsLimit }}
        </span>
        <UtilizationBar
          :percent="(clinic.patientsUsed / clinic.patientsLimit) * 100"
          :show-label="false"
        />
      </div>
    </td>

    <!-- Health Score con badge de color -->
    <td class="px-4 py-3">
      <HealthBadge :score="clinic.healthScore" />
    </td>

    <!-- MRR en USD -->
    <td class="px-4 py-3 text-sm font-medium text-slate-dark">
      ${{ (clinic.mrr || 0).toLocaleString() }}
    </td>

    <!-- Último login -->
    <td class="px-4 py-3 text-xs text-slate-medium">
      {{ formatDate(clinic.lastLogin) }}
    </td>

  </tr>
</template>

<script setup>
/**
 * ClinicRow.vue — Fila individual de la tabla de clínicas
 * ========================================================
 * Renderiza los datos de una clínica en una fila de la tabla.
 * Emite 'click' para que el padre (ClinicTable) abra el drawer.
 */
import { computed } from 'vue'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import StatusBadge from '../shared/StatusBadge.vue'
import HealthBadge from '../shared/HealthBadge.vue'
import UtilizationBar from '../shared/UtilizationBar.vue'

const props = defineProps({
  clinic: { type: Object, required: true },
})

defineEmits(['click'])

// Colores del badge de tier
const TIER_COLORS = {
  Starter:    'bg-slate-light text-slate',
  Growth:     'bg-indigo-light text-indigo',
  Enterprise: 'bg-amber-light text-amber',
}
const tierClass = computed(() => TIER_COLORS[props.clinic.tier] || 'bg-slate-light text-slate')

/** Formatea la fecha del último login de forma relativa (ej. "hace 3 días") */
function formatDate(dateValue) {
  if (!dateValue) return 'Nunca'
  try {
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue)
    return formatDistanceToNow(date, { addSuffix: true, locale: es })
  } catch {
    return '—'
  }
}
</script>
