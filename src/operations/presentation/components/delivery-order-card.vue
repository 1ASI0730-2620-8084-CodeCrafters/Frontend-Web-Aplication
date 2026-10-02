<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    deliveryOrder: { type: Object, required: true }
});

const emit = defineEmits(['report']);
const { t, locale } = useI18n();

const STATUS_TONES = {
    on_route: 'info',
    scheduled: 'neutral',
    delivered: 'success',
    partially_delivered: 'warning',
    not_delivered: 'danger'
};

const titleId = computed(() => `delivery-order-${props.deliveryOrder.id}`);
const statusTone = computed(() => STATUS_TONES[props.deliveryOrder.trackingStatus]);

function formatDate(value) {
    const date = value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(value);
    return new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium' }).format(date);
}
</script>

<template>
    <article class="delivery-order-card" :aria-labelledby="titleId">
        <header class="delivery-order-card__header">
            <div>
                <h3 :id="titleId" class="delivery-order-card__title">{{ t('operations.tracking.operation', { code: deliveryOrder.operationCode }) }}</h3>
                <p class="delivery-order-card__meta">{{ deliveryOrder.deliveryPointName }} &middot; {{ formatDate(deliveryOrder.scheduledDate) }}</p>
            </div>
            <pv-tag :value="t(`operations.tracking.statuses.${deliveryOrder.trackingStatus}`)" :class="['delivery-order-card__status', `delivery-order-card__status--${statusTone}`]"/>
        </header>
        <dl class="delivery-order-card__details">
            <template v-if="deliveryOrder.isRegistered">
                <div>
                    <dt>{{ t('operations.tracking.received') }}</dt>
                    <dd>{{ t('operations.tracking.boxes-of', { quantity: deliveryOrder.deliveredQuantity ?? 0, planned: deliveryOrder.plannedQuantity }) }}</dd>
                </div>
                <div v-if="deliveryOrder.confirmedAt">
                    <dt>{{ t('operations.tracking.delivered-on') }}</dt>
                    <dd>{{ formatDate(deliveryOrder.confirmedAt) }}</dd>
                </div>
                <div v-if="deliveryOrder.shortage > 0">
                    <dt>{{ t('operations.tracking.missing') }}</dt>
                    <dd>{{ t('operations.tracking.boxes', { quantity: deliveryOrder.shortage }) }}</dd>
                </div>
                <div v-if="deliveryOrder.failureReason" class="delivery-order-card__wide">
                    <dt>{{ t('operations.tracking.reason') }}</dt>
                    <dd>{{ deliveryOrder.failureReason }}</dd>
                </div>
            </template>
            <template v-else>
                <div>
                    <dt>{{ t('operations.tracking.ordered') }}</dt>
                    <dd>{{ t('operations.tracking.boxes', { quantity: deliveryOrder.plannedQuantity }) }}</dd>
                </div>
                <div v-if="deliveryOrder.isOnRoute">
                    <dt>{{ t('operations.tracking.progress') }}</dt>
                    <dd>{{ t('operations.tracking.stops-before', deliveryOrder.pendingStopsBefore) }}</dd>
                </div>
            </template>
        </dl>
        <footer v-if="deliveryOrder.isRegistered" class="delivery-order-card__footer">
            <pv-tag v-if="deliveryOrder.hasReportedProblem" :value="t('operations.tracking.reported')" severity="secondary" icon="pi pi-check"/>
            <pv-button
                v-else
                :label="t('operations.tracking.report')"
                icon="pi pi-exclamation-circle"
                severity="secondary"
                outlined
                size="small"
                @click="emit('report', deliveryOrder)"/>
        </footer>
    </article>
</template>

<style scoped>
.delivery-order-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-5);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--surface);
}

.delivery-order-card__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-3);
}

.delivery-order-card__status {
    flex-shrink: 0;
    font-weight: var(--weight-semibold);
}

.delivery-order-card__status--info {
    background: var(--info-soft);
    color: var(--info-strong);
}

.delivery-order-card__status--neutral {
    background: var(--fill-10);
    color: var(--foreground);
}

.delivery-order-card__status--success {
    background: var(--success-soft);
    color: var(--success-strong);
}

.delivery-order-card__status--warning {
    background: var(--warning-soft);
    color: var(--warning-strong);
}

.delivery-order-card__status--danger {
    background: var(--danger-soft);
    color: var(--danger-strong);
}

.delivery-order-card__title {
    font-size: var(--text-lg);
}

.delivery-order-card__meta {
    margin: var(--space-1) 0 0;
    color: var(--ink-70);
    font-size: var(--text-sm);
}

.delivery-order-card__details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
    gap: var(--space-3);
    margin: 0;
}

.delivery-order-card__wide {
    grid-column: 1 / -1;
}

.delivery-order-card__details dt {
    color: var(--ink-60);
    font-size: var(--text-xs);
    font-weight: var(--weight-semibold);
    text-transform: uppercase;
}

.delivery-order-card__details dd {
    margin: var(--space-1) 0 0;
    font-weight: var(--weight-medium);
}

.delivery-order-card__footer {
    display: flex;
    justify-content: flex-end;
}
</style>
