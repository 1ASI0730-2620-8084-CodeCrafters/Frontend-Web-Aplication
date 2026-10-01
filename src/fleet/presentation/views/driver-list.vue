<script setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import useFleetStore from '../../application/fleet.store.js';
import useIamStore from '../../../iam/application/iam.store.js';
import StatusBadge from '../../../shared/presentation/components/status-badge.vue';
import DriverFormDialog from '../components/driver-form-dialog.vue';

const STATUS_TONES = { available: 'success', assigned: 'info', inactive: 'neutral' };
const DUPLICATED_FIELD_ERRORS = ['documentNumber-taken', 'licenseNumber-taken'];

const { t } = useI18n();
const toast = useToast();
const store = useFleetStore();
const iamStore = useIamStore();

const loadFailed = ref(false);
const isDialogVisible = ref(false);
const selectedDriver = ref(null);
const formError = ref(null);
const showOnlyAvailable = ref(false);

const visibleDrivers = computed(() => (showOnlyAvailable.value
    ? store.drivers.filter(item => item.isAvailable)
    : store.drivers));

function openDialog(driver = null) {
    selectedDriver.value = driver;
    formError.value = null;
    isDialogVisible.value = true;
}

async function saveDriver(driver) {
    const error = await store.saveDriver(driver);
    formError.value = error;
    if (DUPLICATED_FIELD_ERRORS.includes(error)) return;
    if (!error) isDialogVisible.value = false;
    toast.add({
        severity: error ? 'error' : 'success',
        summary: error ? t('shared.form.failure') : t('fleet.drivers.saved', { name: driver.fullName }),
        life: 4000
    });
}

onMounted(() => store.fetchDrivers(iamStore.currentUser.organizationId).catch(() => {
    loadFailed.value = true;
}));
</script>

<template>
    <section class="page" aria-labelledby="drivers-title">
        <div class="page__header">
            <div>
                <h1 id="drivers-title" class="page__title">{{ t('fleet.drivers.title') }}</h1>
                <p class="page__lead">{{ t('fleet.drivers.lead') }}</p>
            </div>
            <pv-button :label="t('fleet.drivers.new')" icon="pi pi-plus" @click="openDialog()"/>
        </div>
        <div class="fleet-filter">
            <pv-checkbox v-model="showOnlyAvailable" input-id="drivers-only-available" binary/>
            <label for="drivers-only-available">{{ t('fleet.only-available') }}</label>
        </div>
        <pv-message v-if="loadFailed" severity="error" role="alert">{{ t('shared.load-error') }}</pv-message>
        <div v-else class="panel panel--table">
            <pv-data-table :value="visibleDrivers" :loading="!store.driversLoaded" data-key="id" sort-field="lastName" :sort-order="1" scrollable>
                <template #empty>{{ t(showOnlyAvailable ? 'fleet.drivers.none-available' : 'fleet.drivers.empty') }}</template>
                <pv-column field="lastName" :header="t('fleet.drivers.name')" sortable>
                    <template #body="{ data }">{{ data.fullName }}</template>
                </pv-column>
                <pv-column field="documentNumber" :header="t('fleet.driver-form.documentNumber')"/>
                <pv-column field="licenseNumber" :header="t('fleet.driver-form.licenseNumber')"/>
                <pv-column field="phone" :header="t('fleet.driver-form.phone')"/>
                <pv-column field="status" :header="t('fleet.driver-form.status')" sortable>
                    <template #body="{ data }">
                        <status-badge :label="t(`fleet.driver-statuses.${data.status}`)" :tone="STATUS_TONES[data.status]"/>
                    </template>
                </pv-column>
                <pv-column :header="t('shared.actions')">
                    <template #body="{ data }">
                        <pv-button icon="pi pi-pencil" text rounded :aria-label="t('fleet.drivers.edit', { name: data.fullName })" @click="openDialog(data)"/>
                    </template>
                </pv-column>
            </pv-data-table>
        </div>
        <driver-form-dialog
            v-model:visible="isDialogVisible"
            :driver="selectedDriver"
            :organization-id="iamStore.currentUser?.organizationId"
            :is-saving="store.isSaving"
            :server-error="formError"
            @submit="saveDriver"/>
    </section>
</template>
