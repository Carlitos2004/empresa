<template>
  <!-- Overlay semitransparente que cubre el fondo al abrir el drawer -->
  <Teleport to="body">
    <Transition name="overlay">
      <div
        v-if="store.isDrawerOpen"
        class="fixed inset-0 bg-slate-dark/40 z-40"
        @click="store.closeDrawer"
      ></div>
    </Transition>

    <!-- Panel del drawer lateral (desliza desde la derecha) -->
    <Transition name="drawer">
      <div
        v-if="store.isDrawerOpen"
        class="fixed top-0 right-0 h-full w-[480px] bg-white shadow-drawer z-50
               flex flex-col overflow-hidden"
      >

        <!-- Header del drawer -->
        <div class="px-6 py-5 border-b border-slate/10 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 class="text-base font-semibold text-slate-dark">
              {{ clinic?.name || 'Cargando...' }}
            </h2>
            <p class="text-xs text-slate-medium mt-0.5">ID: {{ clinic?.id }}</p>
          </div>
          <button
            @click="store.closeDrawer"
            class="p-2 rounded-lg text-slate hover:bg-slate-light transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Contenido del drawer (scrolleable) -->
        <div class="flex-1 overflow-y-auto scrollbar-thin px-6 py-5 space-y-6">

          <!-- Skeleton de carga -->
          <div v-if="!clinic" class="space-y-4">
            <div v-for="i in 6" :key="i" class="h-8 bg-slate/10 rounded animate-pulse"></div>
          </div>

          <template v-else>

            <!-- Sección: Estado y Plan -->
            <section>
              <h3 class="text-xs font-semibold text-slate-medium uppercase tracking-wide mb-3">
                Estado & Plan
              </h3>
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-slate-light rounded-lg p-3">
                  <p class="text-xs text-slate-medium mb-1">Estado</p>
                  <StatusBadge :status="clinic.status" />
                </div>
                <div class="bg-slate-light rounded-lg p-3">
                  <p class="text-xs text-slate-medium mb-1">Tier</p>
                  <p class="text-sm font-semibold text-slate-dark">{{ clinic.tier }}</p>
                </div>
                <div class="bg-slate-light rounded-lg p-3">
                  <p class="text-xs text-slate-medium mb-1">Health Score</p>
                  <HealthBadge :score="clinic.healthScore" />
                </div>
                <div class="bg-slate-light rounded-lg p-3">
                  <p class="text-xs text-slate-medium mb-1">MRR</p>
                  <p class="text-sm font-semibold text-slate-dark">
                    ${{ (clinic.mrr || 0).toLocaleString() }}
                  </p>
                </div>
              </div>
            </section>

            <!-- Sección: Uso de Pacientes -->
            <section>
              <h3 class="text-xs font-semibold text-slate-medium uppercase tracking-wide mb-3">
                Uso de Pacientes
              </h3>
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-slate">{{ clinic.patientsUsed }} pacientes activos</span>
                  <span class="text-slate-medium">de {{ clinic.patientsLimit }} incluidos</span>
                </div>
                <UtilizationBar
                  :percent="(clinic.patientsUsed / clinic.patientsLimit) * 100"
                  :show-label="true"
                />
              </div>
            </section>

            <!-- Sección: Contacto -->
            <section v-if="clinic.contact">
              <h3 class="text-xs font-semibold text-slate-medium uppercase tracking-wide mb-3">
                Contacto Principal
              </h3>
              <div class="bg-slate-light rounded-lg p-4 space-y-2">
                <p class="text-sm font-medium text-slate-dark">{{ clinic.contact.name }}</p>
                <p class="text-xs text-slate-medium">{{ clinic.contact.role }}</p>
                <a :href="`mailto:${clinic.contact.email}`"
                   class="text-xs text-indigo hover:underline block">
                  {{ clinic.contact.email }}
                </a>
                <p v-if="clinic.contact.phone" class="text-xs text-slate-medium">
                  {{ clinic.contact.phone }}
                </p>
              </div>
            </section>

            <!-- Sección: Suscripción -->
            <section>
              <h3 class="text-xs font-semibold text-slate-medium uppercase tracking-wide mb-3">
                Suscripción
              </h3>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p class="text-xs text-slate-medium">Inicio</p>
                  <p class="font-medium text-slate-dark">
                    {{ formatDate(clinic.subscriptionStart) }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-slate-medium">Próxima factura</p>
                  <p class="font-medium text-slate-dark">
                    {{ formatDate(clinic.nextBillingDate) }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-slate-medium">Facturas pendientes</p>
                  <p class="font-medium" :class="clinic.outstandingInvoices > 0 ? 'text-red' : 'text-green'">
                    {{ clinic.outstandingInvoices }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-slate-medium">Revenue total</p>
                  <p class="font-medium text-slate-dark">
                    ${{ (clinic.totalRevenue || 0).toLocaleString() }}
                  </p>
                </div>
              </div>
            </section>

            <!-- Sección: Notas internas -->
            <section v-if="clinic.notes">
              <h3 class="text-xs font-semibold text-slate-medium uppercase tracking-wide mb-3">
                Notas Internas
              </h3>
              <p class="text-sm text-slate bg-amber-light border border-amber/20 rounded-lg p-3">
                {{ clinic.notes }}
              </p>
            </section>

          </template>
        </div>

        <!-- Footer del drawer: acciones -->
        <div class="px-6 py-4 border-t border-slate/10 flex gap-3 flex-shrink-0">
          <button class="btn-secondary flex-1 justify-center text-xs" @click="store.closeDrawer">
            Cerrar
          </button>
          <button
            v-if="authStore.isSuperAdmin"
            class="btn-danger flex-1 justify-center text-xs"
            @click="onImpersonate"
          >
            Impersonar
          </button>
        </div>

      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
/**
 * ClinicDrawer.vue — Panel lateral de detalle de clínica
 * =======================================================
 * Se monta una sola vez en ClinicsView y se muestra/oculta
 * mediante el estado `isDrawerOpen` de la store.
 * Usa Teleport para renderizarse fuera del árbol DOM normal
 * (evita problemas de z-index y overflow).
 */
import { computed } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useClinicsStore } from '../../stores/clinics'
import { useAuthStore } from '../../stores/auth'
import StatusBadge from '../shared/StatusBadge.vue'
import HealthBadge from '../shared/HealthBadge.vue'
import UtilizationBar from '../shared/UtilizationBar.vue'
import { impersonateClinic } from '../../api/clinics'

const store = useClinicsStore()
const authStore = useAuthStore()

const clinic = computed(() => store.selectedClinic)

/** Formatea una fecha para mostrar en el drawer */
function formatDate(dateValue) {
  if (!dateValue) return '—'
  try {
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue)
    return format(date, "d MMM yyyy", { locale: es })
  } catch {
    return '—'
  }
}

/** Inicia sesión de impersonación (solo super-admins) */
async function onImpersonate() {
  if (!clinic.value) return
  const reason = prompt('Motivo de la impersonación (obligatorio para auditoría):')
  if (!reason || reason.length < 10) {
    alert('El motivo debe tener al menos 10 caracteres.')
    return
  }

  try {
    const response = await impersonateClinic(clinic.value.id, reason)
    alert(`Sesión de impersonación iniciada.\nToken: ${response.sessionToken}\nExpira: ${new Date(response.expiresAt).toLocaleString()}`)
  } catch (err) {
    alert(`Error al impersonar: ${err.message}`)
  }
}
</script>

<style scoped>
/* Transición del overlay de fondo */
.overlay-enter-active, .overlay-leave-active { transition: opacity 0.2s ease; }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }

/* Transición del panel del drawer (desliza desde la derecha) */
.drawer-enter-active, .drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.drawer-enter-from, .drawer-leave-to { transform: translateX(100%); }
</style>
