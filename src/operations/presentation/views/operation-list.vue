<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import useTransportOperationsStore from '../../application/transport-operations.store.js';
import useIamStore from '../../../iam/application/iam.store.js';
import { CreateOperationCommand } from '../../domain/model/operation-commands.js';
import { OPERATION_STATUSES } from '../../domain/model/delivery-status.js';
import StatusBadge from '../../../shared/presentation/components/status-badge.vue';
import { formatDate } from '../../../shared/presentation/date-format.js';
import CreateOperationDialog from '../components/create-operation-dialog.vue';
import { OPERATION_STATUS_TONES } from '../status-tones.js';

const ALL_STATUSES = 'all';
const FILTERABLE_STATUSES = [ALL_STATUSES, OPERATION_STATUSES.PENDING, OPERATION_STATUSES.IN_PROGRESS, OPERATION_STATUSES.COMPLETED, OPERATION_STATUSES.CANCELLED];

const { t, locale } = useI18n();
const router = useRouter();
const toast = useToast();
const store = useTransportOperationsStore();
const iamStore = useIamStore();

const loadFailed = ref(false);
const isDialogVisible = ref(false);
const statusFilter = ref(ALL_STATUSES);

const statusOptions = computed(() => FILTERABLE_STATUSES.map(status => ({ value: status, label: t(`operations.statuses.${status}`) })));
const filteredOperations = computed(() => (statusFilter.value === ALL_STATUSES
    ? store.operations
    : store.operations.filter(operation => operation.status === statusFilter.value)));

function openOperation(operation) {
    router.push({ name: 'operation-detail', params: { id: operation.id } });
}

async function createOperation(formValues) {
    const command = new CreateOperationCommand({ organizationId: iamStore.currentUser.organizationId, ...formValues });
    const { operationId, error } = await store.createOperation(command);
    if (error) {
        toast.add({ severity: 'error', summary: t('shared.form.failure'), life: 4000 });
        return;
    }
    isDialogVisible.value = false;
    router.push({ name: 'operation-detail', params: { id: operationId } });
}

onMounted(() => store.fetchOperations(iamStore.currentUser.organizationId).catch(() => {
    loadFailed.value = true;
}));
</script>

<template>
    <section class="page" aria-labelledby="operations-title">
        <div class="page__header">
            <div>
                <h1 id="operations-title" class="page__title">{{ t('operations.list.title') }}</h1>
                <p class="page__lead">{{ t('operations.list.lead') }}</p>
            </div>
            <pv-button :label="t('operations.list.new')" icon="pi pi-plus" @click="isDialogVisible = true"/>
        </div>
        <pv-select-button
            v-model="statusFilter"
            :options="statusOptions"
            option-label="label"
            option-value="value"
            :allow-empty="false"
            :aria-label="t('operations.list.filter')"
            class="operation-list__filter"/>
        <pv-message v-if="loadFailed" severity="error" role="alert">{{ t('shared.load-error') }}</pv-message>
        <div v-else class="panel panel--table">
            <pv-data-table
                :value="filteredOperations"
                :loading="!store.operationsLoaded"
                data-key="id"
                row-hover
                scrollable
                :pt="{ bodyRow: { class: 'operation-list__row' } }"
                @row-click="({ data }) => openOperation(data)">
                <template #empty>{{ t('operations.list.empty') }}</template>
                <pv-column field="code" :header="t('operations.list.code')">
                    <template #body="{ data }">
                        <router-link :to="{ name: 'operation-detail', params: { id: data.id } }" class="operation-list__link" @click.stop>{{ data.code }}</router-link>
                    </template>
                </pv-column>
                <pv-column field="description" :header="t('operations.list.route')"/>
                <pv-column field="scheduledDate" :header="t('operations.list.date')">
                    <template #body="{ data }">{{ formatDate(data.scheduledDate, locale) }}</template>
                </pv-column>
                <pv-column :header="t('operations.list.vehicle')">
                    <template #body="{ data }">{{ data.vehiclePlateNumber || t('operations.list.unassigned') }}</template>
                </pv-column>
                <pv-column :header="t('operations.list.driver')">
                    <template #body="{ data }">{{ data.driverName || t('operations.list.unassigned') }}</template>
                </pv-column>
                <pv-column :header="t('operations.list.deliveries')">
                    <template #body="{ data }">{{ data.registeredStopsCount }} / {{ data.stops.length }}</template>
                </pv-column>
                <pv-column field="status" :header="t('operations.list.status')">
                    <template #body="{ data }">
                        <status-badge :label="t(`operations.statuses.${data.status}`)" :tone="OPERATION_STATUS_TONES[data.status]"/>
                    </template>
                </pv-column>
            </pv-data-table>
        </div>
        <create-operation-dialog v-model:visible="isDialogVisible" :is-saving="store.isSaving" @submit="createOperation"/>
    </section>
</template>

<style scoped>
.operation-list__filter {
    flex-wrap: wrap;
}

.operation-list__link {
    color: var(--primary-mid);
    font-weight: var(--weight-semibold);
}

:deep(.operation-list__row) {
    cursor: pointer;
}
</style>
