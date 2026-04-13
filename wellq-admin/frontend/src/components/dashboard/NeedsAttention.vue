<template>
  <div class="card">
    <h3 class="text-sm font-semibold text-slate-dark mb-4">⚡ Needs Attention</h3>

    <!-- Lista vacía -->
    <p v-if="!items.length" class="text-sm text-slate-medium text-center py-4">
      ✅ Todo en orden — no hay alertas activas.
    </p>

    <!-- Lista de alertas -->
    <div class="space-y-2">
      <div
        v-for="item in items"
        :key="`${item.clinicId}-${item.issueType}`"
        class="flex items-start gap-3 p-3 rounded-lg border"
        :class="severityClass(item.severity)"
      >
        <!-- Icono de severidad -->
        <span class="text-base flex-shrink-0 mt-0.5">
          {{ item.severity === 'critical' ? '🔴' : item.severity === 'warning' ? '🟡' : '🔵' }}
        </span>

        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-slate-dark">{{ item.clinicName }}</p>
          <p class="text-xs text-slate-medium mt-0.5">{{ item.description }}</p>
        </div>

        <!-- Botón de acción (si tiene URL) -->
        <a
          v-if="item.actionUrl"
          :href="item.actionUrl"
          class="text-xs text-indigo hover:underline flex-shrink-0"
        >Ver →</a>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * NeedsAttention.vue — Panel de alertas y items de atención
 * ==========================================================
 * Muestra la lista de clínicas y eventos que requieren acción del administrador.
 */

defineProps({
  items: { type: Array, default: () => [] },
})

/** Clase de color del contenedor según severidad */
function severityClass(severity) {
  if (severity === 'critical') return 'border-red/20 bg-red-light'
  if (severity === 'warning')  return 'border-amber/20 bg-amber-light'
  return 'border-indigo/20 bg-indigo-light'
}
</script>
