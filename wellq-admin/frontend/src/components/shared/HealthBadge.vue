<template>
  <!-- Badge de health score con color según el valor (0-100) -->
  <span
    class="badge font-semibold"
    :class="badgeClass"
  >
    {{ score }}
  </span>
</template>

<script setup>
/**
 * HealthBadge.vue — Badge del Health Score de una clínica
 * ========================================================
 * Muestra el health score (0-100) de una clínica con colores
 * que indican el nivel de salud:
 * - Verde:  80-100 (saludable)
 * - Ámbar:  50-79  (advertencia)
 * - Rojo:   0-49   (crítico)
 */
import { computed } from 'vue'

const props = defineProps({
  /** Puntuación de salud de la clínica (0-100) */
  score: { type: Number, required: true },
})

const badgeClass = computed(() => {
  if (props.score >= 80) return 'bg-green-light text-green'
  if (props.score >= 50) return 'bg-amber-light text-amber'
  return 'bg-red-light text-red'
})
</script>
