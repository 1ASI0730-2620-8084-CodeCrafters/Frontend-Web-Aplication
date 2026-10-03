<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import useTransportOperationsStore from '../../application/transport-operations.store.js';
import useIamStore from '../../../iam/application/iam.store.js';
import { OPERATION_STATUSES } from '../../domain/model/delivery-status.js';
import StatusBadge from '../../../shared/presentation/components/status-badge.vue';
import { formatDate, formatDateTime, toIsoDate } from '../../../shared/presentation/date-format.js';
import { OPERATION_STATUS_TONES } from '../status-tones.js';

const { t, locale } = useI18n();
const router = useRouter();
const store = useTransportOperationsStore();
const iamStore = useIamStore();

const loadFailed = ref(false);
const dateRange = ref(null);

const finishedOperations = computed(() => {
    const [start, end] = dateRange.value ?? [];
    const from = start ? toIsoDate(start) : null;
    const to = end ? toIsoDate(end) : from;
    return store.operations
        .filter(operation => operation.status === OPERATION_STATUSES.COMPLETED)
        .filter(operation => !from || (operation.scheduledDate >= from && operation.scheduledDate <= to))
        .sort((first, second) => (second.completedAt ?? '').localeCompare(first.completedAt ?? ''));
});

function openOperation({ data }) {
    router.push({ name: 'operation-detail', params: { id: data.id } });
}

onMounted(() => store.fetchOperations(iamStore.currentUser.organizationId).catch(() => {
    loadFailed.value = true;
}));
</script>

<template>
    <section class="page" aria-labelledby="history-title">
        <div>
            <h1 id="history-title" class="page__title">{{ t('operations.history.title') }}</h1>
            <p class="page__lead">{{ t('operations.history.lead') }}</p>
        </div>
        <div class="list-filters">
            <label for="history-range" class="form-field__label">{{ t('operations.history.range') }}</label>
            <pv-date-picker v-model="dateRange" input-id="history-range" selection-mode="range" :manual-input="false" date-format="yy-mm-dd" show-icon show-button-bar/>
        </div>
        <pv-message v-if="loadFailed" severity="error" role="alert">{{ t('shared.load-error') }}</pv-message>
        <div v-else class="panel panel--table">
            <pv-data-table :value="finishedOperations" :loading="!store.operationsLoaded" data-key="id" row-hover scrollable @row-click="openOperation">
                <template #empty>{{ t('operations.history.empty') }}</template>
                <pv-column field="code" :header="t('operations.list.code')">
                    <template #body="{ data }">
                        <router-link :to="{ name: 'operation-detail', params: { id: data.id } }" class="history__link" @click.stop>{{ data.code }}</router-link>
                    </template>
                </pv-column>
                <pv-column field="description" :header="t('operations.list.route')"/>
                <pv-column :header="t('operations.list.date')">
                    <template #body="{ data }">{{ formatDate(data.scheduledDate, locale) }}</template>
                </pv-column>
                <pv-column :header="t('operations.history.completed-at')">
                    <template #body="{ data }">{{ formatDateTime(data.completedAt, locale) }}</template>
                </pv-column>
                <pv-column :header="t('operations.list.vehicle')">
                    <template #body="{ data }">{{ data.vehiclePlateNumber || t('operations.list.unassigned') }}</template>
                </pv-column>
                <pv-column :header="t('operations.list.driver')">
                    <template #body="{ data }">{{ data.driverName || t('operations.list.unassigned') }}</template>
                </pv-column>
                <pv-column :header="t('operations.history.results')">
                    <template #body="{ data }">{{ t('operations.history.results-summary', { delivered: data.progress.delivered, partial: data.progress.partiallyDelivered, failed: data.progress.notDelivered }) }}</template>
                </pv-column>
                <pv-column :header="t('operations.list.status')">
                    <template #body="{ data }">
                        <status-badge :label="t(`operations.statuses.${data.status}`)" :tone="OPERATION_STATUS_TONES[data.status]"/>
                    </template>
                </pv-column>
            </pv-data-table>
        </div>
    </section>
</template>

<style scoped>
.history__link {
    color: var(--primary-mid);
    font-weight: var(--weight-semibold);
}

:deep(.p-datatable-tbody > tr) {
    cursor: pointer;
}
</style>
