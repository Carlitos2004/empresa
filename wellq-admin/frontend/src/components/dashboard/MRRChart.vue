<template>
  <div class="card">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-semibold text-slate-dark">MRR — Últimos 12 meses</h3>
      <div class="flex gap-3 text-xs text-slate-medium">
        <span class="flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-indigo inline-block"></span> Total
        </span>
        <span class="flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-green inline-block"></span> Nuevo
        </span>
        <span class="flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-red inline-block"></span> Churned
        </span>
      </div>
    </div>

    <!-- Canvas donde Chart.js renderiza el gráfico -->
    <div class="relative h-52">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup>
/**
 * MRRChart.vue — Gráfico de líneas del MRR mensual
 * ==================================================
 * Usa Chart.js (a través de vue-chartjs) para renderizar la evolución
 * del MRR con tres series: total, nuevo y churned.
 */
import { ref, onMounted, watch } from 'vue'
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler } from 'chart.js'

// Registrar solo los componentes de Chart.js que usamos (tree-shaking)
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler)

const props = defineProps({
  /** Datos del gráfico (MRRChartResponse del backend) */
  chartData: { type: Object, default: null },
})

const chartCanvas = ref(null)
let chartInstance = null

/** Crea o actualiza la instancia del gráfico */
function renderChart(data) {
  if (!chartCanvas.value || !data) return

  // Destruir instancia anterior si existe
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  const labels = data.data.map(d => d.month)
  const mrrValues = data.data.map(d => d.mrr)
  const newMrrValues = data.data.map(d => d.newMrr || 0)
  const churnedValues = data.data.map(d => d.churnedMrr || 0)

  chartInstance = new Chart(chartCanvas.value, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'MRR Total',
          data: mrrValues,
          borderColor: '#4F46E5',  // Indigo
          backgroundColor: 'rgba(79, 70, 229, 0.08)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
        },
        {
          label: 'Nuevo MRR',
          data: newMrrValues,
          borderColor: '#059669',  // Verde
          backgroundColor: 'transparent',
          borderDash: [4, 4],
          tension: 0.4,
          borderWidth: 1.5,
          pointRadius: 2,
        },
        {
          label: 'MRR Churned',
          data: churnedValues,
          borderColor: '#DC2626',  // Rojo
          backgroundColor: 'transparent',
          borderDash: [4, 4],
          tension: 0.4,
          borderWidth: 1.5,
          pointRadius: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            // Formatear los valores como moneda USD en el tooltip
            label: (ctx) => ` ${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString()}`,
          },
        },
      },
      scales: {
        y: {
          grid: { color: 'rgba(71, 85, 105, 0.06)' },
          ticks: {
            font: { size: 10 },
            color: '#94A3B8',
            callback: (v) => `$${(v / 1000).toFixed(0)}k`,
          },
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 10 }, color: '#94A3B8' },
        },
      },
    },
  })
}

// Renderizar cuando el componente se monta o los datos cambian
onMounted(() => renderChart(props.chartData))
watch(() => props.chartData, (newData) => renderChart(newData))
</script>
