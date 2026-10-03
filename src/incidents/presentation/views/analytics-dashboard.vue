<script setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import useIncidentsStore from '../../application/incidents.store.js';
import useIamStore from '../../../iam/application/iam.store.js';
import { toIsoDate } from '../../../shared/presentation/date-format.js';

const REGISTERED_DELIVERY_STATUSES = ['delivered', 'partially_delivered', 'not_delivered'];

const { t } = useI18n();
const store = useIncidentsStore();
const iamStore = useIamStore();

const loadFailed = ref(false);
const currentMonth = toIsoDate(new Date()).slice(0, 7);

const monthOperations = computed(() => store.operations.filter(operation => operation.scheduledDate.startsWith(currentMonth) && operation.status !== 'cancelled'));
const monthStops = computed(() => {
    const operationIds = monthOperations.value.map(operation => operation.id);
    return store.stops.filter(stop => operationIds.includes(stop.transportOperationId));
});
const indicators = computed(() => {
    const stops = monthStops.value;
    const delivered = stops.filter(stop => stop.status === 'delivered').length;
    const shrinkage = stops
        .filter(stop => REGISTERED_DELIVERY_STATUSES.includes(stop.status))
        .reduce((total, stop) => total + Math.max(stop.plannedQuantity - (stop.deliveredQuantity ?? 0), 0), 0);
    return [
        { key: 'operations', value: monthOperations.value.length, tone: 'neutral' },
        { key: 'completed-deliveries', value: `${stops.length ? Math.round((delivered / stops.length) * 100) : 0} %`, tone: 'success' },
        { key: 'open-incidents', value: store.openIncidents.length, tone: store.openIncidents.length ? 'danger' : 'neutral' },
        { key: 'shrinkage', value: t('incidents.dashboard.boxes', { quantity: shrinkage }), tone: shrinkage ? 'warning' : 'neutral' }
    ];
});
const operationsInProgress = computed(() => store.operations.filter(operation => operation.status === 'in_progress').map(operation => {
    const stops = store.stops.filter(stop => stop.transportOperationId === operation.id);
    return { ...operation, registered: stops.filter(stop => stop.status !== 'pending').length, total: stops.length };
}));

onMounted(() => store.fetchIncidents(iamStore.currentUser.organizationId).catch(() => {
    loadFailed.value = true;
}));
</script>

<template>
    <section class="page" aria-labelledby="dashboard-title">
        <div>
            <h1 id="dashboard-title" class="page__title">{{ t('incidents.dashboard.title') }}</h1>
            <p class="page__lead">{{ t('incidents.dashboard.lead') }}</p>
        </div>
        <pv-message v-if="loadFailed" severity="error" role="alert">{{ t('shared.load-error') }}</pv-message>
        <template v-else-if="store.incidentsLoaded">
            <p v-if="monthOperations.length === 0" class="page__lead" role="status">{{ t('incidents.dashboard.no-operations') }}</p>
            <dl class="dashboard__indicators">
                <div v-for="indicator in indicators" :key="indicator.key" class="dashboard__indicator" :class="`dashboard__indicator--${indicator.tone}`">
                    <dt>{{ t(`incidents.dashboard.${indicator.key}`) }}</dt>
                    <dd>{{ indicator.value }}</dd>
                </div>
            </dl>
            <section class="panel panel--table" aria-labelledby="in-progress-title">
                <h2 id="in-progress-title" class="dashboard__section-title">{{ t('incidents.dashboard.in-progress') }}</h2>
                <pv-data-table :value="operationsInProgress" data-key="id" scrollable>
                    <template #empty>{{ t('incidents.dashboard.none-in-progress') }}</template>
                    <pv-column field="code" :header="t('incidents.list.operation')"/>
                    <pv-column field="description" :header="t('incidents.dashboard.route')"/>
                    <pv-column :header="t('incidents.dashboard.deliveries')">
                        <template #body="{ data }">{{ data.registered }} / {{ data.total }}</template>
                    </pv-column>
                </pv-data-table>
            </section>
        </template>
        <p v-else class="page__lead" role="status">{{ t('incidents.dashboard.loading') }}</p>
    </section>
</template>

<style scoped>
.dashboard__indicators {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
    gap: var(--space-4);
    margin: 0;
}

.dashboard__indicator {
    display: flex;
    flex-direction: column-reverse;
    gap: var(--space-1);
    padding: var(--space-5);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--surface);
}

.dashboard__indicator dt {
    color: var(--ink-70);
    font-size: var(--text-sm);
}

.dashboard__indicator dd {
    margin: 0;
    color: var(--primary-dark);
    font-size: var(--text-3xl);
    font-weight: var(--weight-bold);
}

.dashboard__indicator--danger {
    border-color: var(--danger-soft);
    background: var(--danger-soft);
}

.dashboard__indicator--danger dd,
.dashboard__indicator--danger dt {
    color: var(--danger-strong);
}

.dashboard__indicator--warning dd {
    color: var(--warning-strong);
}

.dashboard__indicator--success dd {
    color: var(--success-strong);
}

.dashboard__section-title {
    padding: var(--space-5) var(--space-5) var(--space-3);
    font-size: var(--text-lg);
}
</style>
