<template>
  <!-- Tarjeta de KPI: valor principal + etiqueta + tendencia -->
  <div class="card flex flex-col gap-3">

    <!-- Fila superior: etiqueta + ícono de tendencia -->
    <div class="flex items-center justify-between">
      <p class="text-xs font-medium text-slate-medium uppercase tracking-wide">
        {{ label }}
      </p>
      <!-- Flecha de tendencia: verde=sube (bueno), rojo=baja (malo) o viceversa -->
      <span
        class="flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded"
        :class="trendColor"
      >
        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path v-if="trend === 'up'"    stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/>
          <path v-if="trend === 'down'"  stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
          <path v-if="trend === 'flat'"  stroke-linecap="round" stroke-linejoin="round" d="M5 12h14"/>
        </svg>
        {{ changePercent !== 0 ? `${Math.abs(changePercent)}%` : '—' }}
      </span>
    </div>

    <!-- Valor principal del KPI -->
    <p class="text-2xl font-bold text-slate-dark leading-none">
      {{ value }}
    </p>

    <!-- Texto descriptivo de la comparación -->
    <p class="text-xs text-slate-medium">
      vs. mes anterior
    </p>

  </div>
</template>

<script setup>
/**
 * KPICard.vue — Tarjeta de indicador clave de negocio
 * =====================================================
 * Muestra un valor, su etiqueta y la tendencia respecto al período anterior.
 * El color de la tendencia depende de si "subir" es positivo o negativo
 * para este KPI (ej. para churn, bajar es positivo).
 */
import { computed } from 'vue'

const props = defineProps({
  /** Nombre del KPI (ej. "MRR Total") */
  label: { type: String, required: true },
  /** Valor formateado (ej. "$42,300" o "87") */
  value: { type: String, required: true },
  /** Porcentaje de cambio vs período anterior */
  changePercent: { type: Number, default: 0 },
  /** Dirección del cambio: 'up' | 'down' | 'flat' */
  trend: { type: String, default: 'flat' },
  /** Si true, 'up' es positivo (verde). Si false, 'up' es negativo (rojo). */
  positiveTrendIsUp: { type: Boolean, default: true },
})

/**
 * Calcula el color del badge de tendencia.
 * Para la mayoría de KPIs: up = verde, down = rojo.
 * Para churn: up = rojo (más churn = malo), down = verde (menos churn = bueno).
 */
const trendColor = computed(() => {
  if (props.trend === 'flat') return 'bg-slate-light text-slate-medium'

  const isPositive = props.positiveTrendIsUp
    ? props.trend === 'up'
    : props.trend === 'down'

  return isPositive
    ? 'bg-green-light text-green'
    : 'bg-red-light text-red'
})
</script>
