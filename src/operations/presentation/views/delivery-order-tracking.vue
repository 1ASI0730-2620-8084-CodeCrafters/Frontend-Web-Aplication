<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import useOperationsStore from '../../application/operations.store.js';
import useIamStore from '../../../iam/application/iam.store.js';
import { ReportReceptionProblemCommand } from '../../domain/model/report-reception-problem.command.js';
import DeliveryOrderCard from '../components/delivery-order-card.vue';
import ReceptionProblemDialog from '../components/reception-problem-dialog.vue';

const { t } = useI18n();
const toast = useToast();
const store = useOperationsStore();
const iamStore = useIamStore();

const selectedDeliveryOrder = ref(null);
const isDialogVisible = ref(false);

function loadDeliveryOrders() {
    store.fetchDeliveryOrders(iamStore.currentUser.id);
}

function openReportDialog(deliveryOrder) {
    selectedDeliveryOrder.value = deliveryOrder;
    isDialogVisible.value = true;
}

async function submitReport(formValues) {
    const command = new ReportReceptionProblemCommand({
        deliveryOrder: selectedDeliveryOrder.value,
        reportedBy: iamStore.currentUser.id,
        ...formValues
    });
    const wasReported = await store.reportReceptionProblem(command);
    if (wasReported) isDialogVisible.value = false;
    toast.add({
        severity: wasReported ? 'success' : 'error',
        summary: t(wasReported ? 'operations.tracking.problem.success' : 'operations.tracking.problem.failure'),
        life: 4000
    });
}

onMounted(loadDeliveryOrders);
</script>

<template>
    <section class="page" aria-labelledby="delivery-order-tracking-title">
        <div>
            <h1 id="delivery-order-tracking-title" class="page__title">{{ t('operations.tracking.title') }}</h1>
            <p class="page__lead">{{ t('operations.tracking.lead') }}</p>
        </div>
        <pv-message v-if="store.loadError" severity="error" role="alert">
            <div class="delivery-order-tracking__error">
                <span>{{ t('operations.tracking.load-error') }}</span>
                <pv-button :label="t('operations.tracking.retry')" size="small" text @click="loadDeliveryOrders"/>
            </div>
        </pv-message>
        <p v-else-if="store.isLoading" class="page__lead" role="status">{{ t('operations.tracking.loading') }}</p>
        <template v-else>
            <section class="delivery-order-tracking__group" aria-labelledby="active-orders-title">
                <h2 id="active-orders-title" class="delivery-order-tracking__group-title">{{ t('operations.tracking.active-title') }}</h2>
                <p v-if="store.activeDeliveryOrders.length === 0" class="page__lead">{{ t('operations.tracking.active-empty') }}</p>
                <div v-else class="delivery-order-tracking__grid">
                    <delivery-order-card v-for="order in store.activeDeliveryOrders" :key="order.id" :delivery-order="order"/>
                </div>
            </section>
            <section class="delivery-order-tracking__group" aria-labelledby="registered-orders-title">
                <h2 id="registered-orders-title" class="delivery-order-tracking__group-title">{{ t('operations.tracking.registered-title') }}</h2>
                <p v-if="store.registeredDeliveryOrders.length === 0" class="page__lead">{{ t('operations.tracking.registered-empty') }}</p>
                <div v-else class="delivery-order-tracking__grid">
                    <delivery-order-card
                        v-for="order in store.registeredDeliveryOrders"
                        :key="order.id"
                        :delivery-order="order"
                        @report="openReportDialog"/>
                </div>
            </section>
        </template>
        <reception-problem-dialog
            v-model:visible="isDialogVisible"
            :delivery-order="selectedDeliveryOrder"
            :is-submitting="store.isReporting"
            @submit="submitReport"/>
    </section>
</template>

<style scoped>
.delivery-order-tracking__group {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
}

.delivery-order-tracking__group-title {
    font-size: var(--text-lg);
}

.delivery-order-tracking__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
    gap: var(--space-4);
}

.delivery-order-tracking__error {
    display: flex;
    align-items: center;
    gap: var(--space-3);
}

@media (max-width: 48rem) {
    .delivery-order-tracking__grid {
        grid-template-columns: 1fr;
    }
}
</style>
