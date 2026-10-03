<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import useMonitoringStore from '../../application/monitoring.store.js';
import useIamStore from '../../../iam/application/iam.store.js';
import MonitoredOperationCard from '../components/monitored-operation-card.vue';
import AlertList from '../components/alert-list.vue';

const { t } = useI18n();
const toast = useToast();
const store = useMonitoringStore();
const iamStore = useIamStore();

const loadFailed = ref(false);

function loadMonitoring() {
    loadFailed.value = false;
    store.fetchMonitoring(iamStore.currentUser.organizationId).catch(() => {
        loadFailed.value = true;
    });
}

async function simulateReading(monitoredOperation) {
    const { alertTypes, error } = await store.simulateReading(monitoredOperation, iamStore.currentUser.organizationId);
    if (error) {
        toast.add({ severity: 'error', summary: t('shared.form.failure'), life: 4000 });
        return;
    }
    if (alertTypes.length === 0) {
        toast.add({ severity: 'success', summary: t('monitoring.reading-safe', { code: monitoredOperation.operationCode }), life: 3000 });
        return;
    }
    alertTypes.forEach(type => toast.add({
        severity: 'error',
        summary: t('monitoring.alert-raised', { code: monitoredOperation.operationCode }),
        detail: t(`monitoring.alert-types.${type}`),
        life: 6000
    }));
}

async function acknowledgeAlert(alert) {
    const error = await store.acknowledgeAlert(alert, iamStore.currentUser.id);
    toast.add({ severity: error ? 'error' : 'success', summary: t(error ? 'shared.form.failure' : 'monitoring.alerts.acknowledged'), life: 3000 });
}

async function reportIncident(alert) {
    const description = t('monitoring.alerts.incident-description', {
        type: t(`monitoring.alert-types.${alert.type}`),
        code: alert.operationCode
    });
    const error = await store.reportIncidentFromAlert(alert, { reportedBy: iamStore.currentUser.id, description });
    toast.add({ severity: error ? 'error' : 'success', summary: t(error ? 'shared.form.failure' : 'monitoring.alerts.incident-reported'), life: 4000 });
}

onMounted(loadMonitoring);
</script>

<template>
    <section class="page" aria-labelledby="monitoring-title">
        <div class="page__header">
            <div>
                <h1 id="monitoring-title" class="page__title">{{ t('monitoring.title') }}</h1>
                <p class="page__lead">{{ t('monitoring.lead') }}</p>
            </div>
            <pv-button :label="t('monitoring.refresh')" icon="pi pi-refresh" severity="secondary" outlined @click="loadMonitoring"/>
        </div>
        <pv-message v-if="loadFailed" severity="error" role="alert">{{ t('shared.load-error') }}</pv-message>
        <p v-else-if="!store.monitoringLoaded" class="page__lead" role="status">{{ t('monitoring.loading') }}</p>
        <template v-else>
            <alert-list :alerts="store.pendingAlerts" @acknowledge="acknowledgeAlert" @report-incident="reportIncident"/>
            <p v-if="store.monitoredOperations.length === 0" class="page__lead">{{ t('monitoring.empty') }}</p>
            <div v-else class="monitoring__grid">
                <monitored-operation-card
                    v-for="monitoredOperation in store.monitoredOperations"
                    :key="monitoredOperation.operationId"
                    :monitored-operation="monitoredOperation"
                    :is-saving="store.isSaving"
                    @simulate="simulateReading"/>
            </div>
        </template>
    </section>
</template>

<style scoped>
.monitoring__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(22rem, 1fr));
    gap: var(--space-4);
}

@media (max-width: 48rem) {
    .monitoring__grid {
        grid-template-columns: 1fr;
    }
}
</style>
