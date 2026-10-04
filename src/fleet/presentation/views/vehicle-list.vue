<script setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import useFleetStore from '../../application/fleet.store.js';
import useIamStore from '../../../iam/application/iam.store.js';
import StatusBadge from '../../../shared/presentation/components/status-badge.vue';
import VehicleFormDialog from '../components/vehicle-form-dialog.vue';

const STATUS_TONES = { available: 'success', assigned: 'info', in_maintenance: 'warning' };

const { t } = useI18n();
const toast = useToast();
const store = useFleetStore();
const iamStore = useIamStore();

const loadFailed = ref(false);
const isDialogVisible = ref(false);
const selectedVehicle = ref(null);
const formError = ref(null);
const showOnlyAvailable = ref(false);

const visibleVehicles = computed(() => (showOnlyAvailable.value
    ? store.vehicles.filter(item => item.isAvailable)
    : store.vehicles));

function openDialog(vehicle = null) {
    selectedVehicle.value = vehicle;
    formError.value = null;
    isDialogVisible.value = true;
}

async function saveVehicle(vehicle) {
    const error = await store.saveVehicle(vehicle);
    formError.value = error;
    if (error === 'plate-number-taken') return;
    if (!error) isDialogVisible.value = false;
    toast.add({
        severity: error ? 'error' : 'success',
        summary: error ? t('shared.form.failure') : t('fleet.vehicles.saved', { plateNumber: vehicle.plateNumber.toUpperCase() }),
        life: 4000
    });
}

onMounted(() => store.fetchVehicles(iamStore.currentUser.organizationId).catch(() => {
    loadFailed.value = true;
}));
</script>

<template>
    <section class="page" aria-labelledby="vehicles-title">
        <div class="page__header">
            <div>
                <h1 id="vehicles-title" class="page__title">{{ t('fleet.vehicles.title') }}</h1>
                <p class="page__lead">{{ t('fleet.vehicles.lead') }}</p>
            </div>
            <pv-button :label="t('fleet.vehicles.new')" icon="pi pi-plus" @click="openDialog()"/>
        </div>
        <div class="fleet-filter">
            <pv-checkbox v-model="showOnlyAvailable" input-id="vehicles-only-available" binary/>
            <label for="vehicles-only-available">{{ t('fleet.only-available') }}</label>
        </div>
        <pv-message v-if="loadFailed" severity="error" role="alert">{{ t('shared.load-error') }}</pv-message>
        <div v-else class="panel panel--table">
            <pv-data-table :value="visibleVehicles" :loading="!store.vehiclesLoaded" data-key="id" sort-field="plateNumber" :sort-order="1" scrollable>
                <template #empty>{{ t(showOnlyAvailable ? 'fleet.vehicles.none-available' : 'fleet.vehicles.empty') }}</template>
                <pv-column field="plateNumber" :header="t('fleet.vehicle-form.plateNumber')" sortable/>
                <pv-column field="brand" :header="t('fleet.vehicles.vehicle')" sortable>
                    <template #body="{ data }">{{ data.description }}</template>
                </pv-column>
                <pv-column field="capacityInBoxes" :header="t('fleet.vehicle-form.capacityInBoxes')" sortable/>
                <pv-column field="status" :header="t('fleet.vehicle-form.status')" sortable>
                    <template #body="{ data }">
                        <status-badge :label="t(`fleet.vehicle-statuses.${data.status}`)" :tone="STATUS_TONES[data.status]"/>
                    </template>
                </pv-column>
                <pv-column :header="t('shared.actions')">
                    <template #body="{ data }">
                        <pv-button icon="pi pi-pencil" text rounded :aria-label="t('fleet.vehicles.edit', { plateNumber: data.plateNumber })" @click="openDialog(data)"/>
                    </template>
                </pv-column>
            </pv-data-table>
        </div>
        <vehicle-form-dialog
            v-model:visible="isDialogVisible"
            :vehicle="selectedVehicle"
            :organization-id="iamStore.currentUser?.organizationId"
            :is-saving="store.isSaving"
            :server-error="formError"
            @submit="saveVehicle"/>
    </section>
</template>
