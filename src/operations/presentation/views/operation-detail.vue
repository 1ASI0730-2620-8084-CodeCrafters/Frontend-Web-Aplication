<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import useTransportOperationsStore from '../../application/transport-operations.store.js';
import StatusBadge from '../../../shared/presentation/components/status-badge.vue';
import { formatDate } from '../../../shared/presentation/date-format.js';
import OperationResources from '../components/operation-resources.vue';
import OperationProgress from '../components/operation-progress.vue';
import OperationRoute from '../components/operation-route.vue';
import CancelOperationDialog from '../components/cancel-operation-dialog.vue';
import { OPERATION_STATUS_TONES } from '../status-tones.js';

const { t, locale } = useI18n();
const route = useRoute();
const toast = useToast();
const store = useTransportOperationsStore();

const loadFailed = ref(false);
const isCancelVisible = ref(false);

function notifyResult(error, successKey) {
    if (!error && !successKey) return;
    toast.add({
        severity: error ? 'error' : 'success',
        summary: t(error ? `operations.errors.${error}` : successKey),
        life: 4000
    });
}

async function run(action, successKey) {
    const error = await action();
    notifyResult(error, successKey);
    return error;
}

async function cancelOperation(reason) {
    const error = await run(() => store.cancelOperation(store.currentOperation, reason), 'operations.cancel.success');
    if (!error) isCancelVisible.value = false;
}

onMounted(() => store.fetchOperation(route.params.id).catch(() => {
    loadFailed.value = true;
}));
</script>

<template>
    <section class="page" aria-labelledby="operation-title">
        <nav :aria-label="t('operations.detail.breadcrumb')">
            <router-link :to="{ name: 'operations' }" class="operation-detail__back">
                <i class="pi pi-arrow-left" aria-hidden="true"></i>
                {{ t('operations.list.title') }}
            </router-link>
        </nav>
        <pv-message v-if="loadFailed" severity="error" role="alert">{{ t('operations.detail.not-found') }}</pv-message>
        <template v-else-if="store.currentOperation?.id === route.params.id">
            <div class="page__header">
                <div>
                    <div class="operation-detail__heading">
                        <h1 id="operation-title" class="page__title">{{ store.currentOperation.code }}</h1>
                        <status-badge :label="t(`operations.statuses.${store.currentOperation.status}`)" :tone="OPERATION_STATUS_TONES[store.currentOperation.status]"/>
                    </div>
                    <p class="page__lead">{{ store.currentOperation.description }} &middot; {{ formatDate(store.currentOperation.scheduledDate, locale) }}</p>
                </div>
                <div class="operation-detail__actions">
                <pv-button
                    v-if="store.currentOperation.canCancel"
                    :label="t('operations.cancel.open')"
                    icon="pi pi-times"
                    severity="danger"
                    outlined
                    :disabled="store.isSaving"
                    @click="isCancelVisible = true"/>
                <pv-button
                    v-if="store.currentOperation.isPending"
                    :label="t('operations.detail.start')"
                    icon="pi pi-play"
                    :disabled="!store.currentOperation.canStart"
                    :loading="store.isSaving"
                    @click="run(() => store.startOperation(store.currentOperation), 'operations.detail.started')"/>
                <pv-button
                    v-if="store.currentOperation.isInProgress"
                    :label="t('operations.detail.complete')"
                    icon="pi pi-check"
                    :loading="store.isSaving"
                    @click="run(() => store.completeOperation(store.currentOperation), 'operations.detail.completed')"/>
                </div>
            </div>
            <pv-message v-if="store.currentOperation.cancellationReason" severity="warn">{{ t('operations.cancel.reason-label', { reason: store.currentOperation.cancellationReason }) }}</pv-message>
            <p v-if="store.currentOperation.isPending && !store.currentOperation.canStart" class="operation-detail__hint">
                <i class="pi pi-info-circle" aria-hidden="true"></i>
                {{ t('operations.detail.start-hint') }}
            </p>
            <div class="operation-detail__grid">
                <operation-resources
                    :operation="store.currentOperation"
                    :available-vehicles="store.availableVehicles"
                    :available-drivers="store.availableDrivers"
                    :is-saving="store.isSaving"
                    @assign-vehicle="vehicleId => run(() => store.assignVehicle(store.currentOperation, vehicleId), 'operations.detail.vehicle-assigned')"
                    @assign-driver="driverId => run(() => store.assignDriver(store.currentOperation, driverId), 'operations.detail.driver-assigned')"/>
                <operation-progress :operation="store.currentOperation"/>
            </div>
            <operation-route :operation="store.currentOperation" @result="notifyResult"/>
            <cancel-operation-dialog v-model:visible="isCancelVisible" :operation="store.currentOperation" :is-saving="store.isSaving" @submit="cancelOperation"/>
        </template>
        <p v-else class="page__lead" role="status">{{ t('operations.detail.loading') }}</p>
    </section>
</template>

<style scoped>
.operation-detail__back {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--primary-mid);
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
    text-decoration: none;
}

.operation-detail__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
}

.operation-detail__heading {
    display: flex;
    align-items: center;
    gap: var(--space-3);
}

.operation-detail__hint {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin: 0;
    color: var(--ink-70);
    font-size: var(--text-sm);
}

.operation-detail__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
    gap: var(--space-4);
}

:deep(.operation-panel__title) {
    font-size: var(--text-lg);
}
</style>
