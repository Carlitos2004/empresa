<template>
  <!-- Badge de estado operativo de una clínica o servicio -->
  <span class="badge" :class="badgeClass">
    <!-- Punto de color indicador -->
    <span class="w-1.5 h-1.5 rounded-full mr-1" :class="dotClass"></span>
    {{ label }}
  </span>
</template>

<script setup>
/**
 * StatusBadge.vue — Badge de estado con punto de color
 * ======================================================
 * Mapea el valor de estado a colores y etiquetas visuales.
 * Usado en la tabla de clínicas y en los paneles de infraestructura.
 */
import { computed } from 'vue'

const props = defineProps({
  /** Estado: 'active' | 'warning' | 'critical' | 'churned' | 'healthy' | 'degraded' | 'down' */
  status: { type: String, required: true },
})

// Mapa de estado → estilos y etiqueta
const STATUS_MAP = {
  active:   { badge: 'bg-green-light text-green',   dot: 'bg-green',   label: 'Active' },
  healthy:  { badge: 'bg-green-light text-green',   dot: 'bg-green',   label: 'Healthy' },
  warning:  { badge: 'bg-amber-light text-amber',   dot: 'bg-amber',   label: 'Warning' },
  degraded: { badge: 'bg-amber-light text-amber',   dot: 'bg-amber',   label: 'Degraded' },
  critical: { badge: 'bg-red-light text-red',       dot: 'bg-red',     label: 'Critical' },
  down:     { badge: 'bg-red-light text-red',       dot: 'bg-red',     label: 'Down' },
  churned:  { badge: 'bg-slate-light text-slate',   dot: 'bg-slate',   label: 'Churned' },
  running:  { badge: 'bg-green-light text-green',   dot: 'bg-green',   label: 'Running' },
  stopped:  { badge: 'bg-slate-light text-slate',   dot: 'bg-slate',   label: 'Stopped' },
  error:    { badge: 'bg-red-light text-red',       dot: 'bg-red',     label: 'Error' },
}

const config = computed(() => STATUS_MAP[props.status] || STATUS_MAP.warning)
const badgeClass = computed(() => config.value.badge)
const dotClass   = computed(() => config.value.dot)
const label      = computed(() => config.value.label)
</script>
