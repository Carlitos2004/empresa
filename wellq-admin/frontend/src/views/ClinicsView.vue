<template>
  <div>
    <!-- Tabla principal de clínicas -->
    <ClinicTable />

    <!-- Drawer lateral (se monta una sola vez, se muestra/oculta por la store) -->
    <ClinicDrawer />
  </div>
</template>

<script setup>
/**
 * ClinicsView.vue — Vista de Gestión de Clínicas
 * ================================================
 * Carga la lista de clínicas al montar la vista y muestra
 * la tabla con filtros. El drawer se activa al hacer clic en una fila.
 */
import { onMounted } from 'vue'
import { useClinicsStore } from '../stores/clinics'
import ClinicTable from '../components/clinics/ClinicTable.vue'
import ClinicDrawer from '../components/clinics/ClinicDrawer.vue'

const store = useClinicsStore()

// Cargar la primera página de clínicas al entrar a la vista
onMounted(() => {
  store.loadClinics()
})
</script>
