<template>
  <!-- Barra de progreso de utilización de recursos -->
  <div class="flex items-center gap-2">
    <!-- Barra de fondo -->
    <div class="flex-1 h-1.5 bg-slate/20 rounded-full overflow-hidden">
      <!-- Barra de relleno con color según el porcentaje -->
      <div
        class="h-full rounded-full transition-all duration-500"
        :class="barColor"
        :style="{ width: `${clampedPercent}%` }"
      ></div>
    </div>
    <!-- Valor numérico opcional -->
    <span v-if="showLabel" class="text-xs text-slate-medium w-8 text-right flex-shrink-0">
      {{ clampedPercent }}%
    </span>
  </div>
</template>

<script setup>
/**
 * UtilizationBar.vue — Barra de uso de recursos
 * ================================================
 * Visualiza el porcentaje de uso de un recurso (pacientes, CPU, memoria, etc.)
 * con color adaptativo:
 * - Verde:  0-60%
 * - Ámbar:  61-85%
 * - Rojo:   86-100%
 */
import { computed } from 'vue'

const props = defineProps({
  /** Porcentaje de uso (0-100) */
  percent: { type: Number, required: true },
  /** Si mostrar el valor numérico al lado */
  showLabel: { type: Boolean, default: true },
})

// Asegurar que el porcentaje esté entre 0 y 100
const clampedPercent = computed(() => Math.min(100, Math.max(0, Math.round(props.percent))))

// Color adaptativo según el nivel de uso
const barColor = computed(() => {
  if (clampedPercent.value <= 60) return 'bg-green'
  if (clampedPercent.value <= 85) return 'bg-amber'
  return 'bg-red'
})
</script>
