<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import useMonitoringStore from '../../application/monitoring.store.js';
import useIamStore from '../../../iam/application/iam.store.js';
import StatusBadge from '../../../shared/presentation/components/status-badge.vue';
import SafeRangeDialog from '../components/safe-range-dialog.vue';

const STATUS_TONES = { active: 'success', offline: 'warning', retired: 'neutral' };

const { t } = useI18n();
const toast = useToast();
const store = useMonitoringStore();
const iamStore = useIamStore();

const loadFailed = ref(false);
const isDialogVisible = ref(false);
const selectedDevice = ref(null);

function openDialog(device) {
    selectedDevice.value = device;
    isDialogVisible.value = true;
}

async function saveRange(range) {
    const error = await store.updateSafeRange(selectedDevice.value, range);
    if (!error) isDialogVisible.value = false;
    toast.add({
        severity: error ? 'error' : 'success',
        summary: t(error ? `monitoring.devices.errors.${error}` : 'monitoring.devices.saved', { serial: selectedDevice.value.serialNumber }),
        life: 4000
    });
}

onMounted(() => store.fetchDevices(iamStore.currentUser.organizationId).catch(() => {
    loadFailed.value = true;
}));
</script>

<template>
    <section class="page" aria-labelledby="devices-title">
        <div>
            <h1 id="devices-title" class="page__title">{{ t('monitoring.devices.title') }}</h1>
            <p class="page__lead">{{ t('monitoring.devices.lead') }}</p>
        </div>
        <pv-message v-if="loadFailed" severity="error" role="alert">{{ t('shared.load-error') }}</pv-message>
        <div v-else class="panel panel--table">
            <pv-data-table :value="store.devices" :loading="!store.devicesLoaded" data-key="id" scrollable>
                <template #empty>{{ t('monitoring.devices.empty') }}</template>
                <pv-column field="serialNumber" :header="t('monitoring.devices.serial')"/>
                <pv-column field="vehiclePlateNumber" :header="t('monitoring.devices.vehicle')"/>
                <pv-column :header="t('monitoring.devices.temperature-range')">
                    <template #body="{ data }">{{ data.safeTemperatureMin }} °C – {{ data.safeTemperatureMax }} °C</template>
                </pv-column>
                <pv-column :header="t('monitoring.devices.impact-threshold')">
                    <template #body="{ data }">{{ data.impactThreshold }} g</template>
                </pv-column>
                <pv-column :header="t('monitoring.devices.status')">
                    <template #body="{ data }">
                        <status-badge :label="t(`monitoring.devices.statuses.${data.status}`)" :tone="STATUS_TONES[data.status]"/>
                    </template>
                </pv-column>
                <pv-column :header="t('shared.actions')">
                    <template #body="{ data }">
                        <pv-button icon="pi pi-sliders-h" text rounded :aria-label="t('monitoring.devices.edit', { serial: data.serialNumber })" @click="openDialog(data)"/>
                    </template>
                </pv-column>
            </pv-data-table>
        </div>
        <safe-range-dialog v-model:visible="isDialogVisible" :device="selectedDevice" :is-saving="store.isSaving" @submit="saveRange"/>
    </section>
</template>
