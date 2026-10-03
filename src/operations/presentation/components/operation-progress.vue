<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    operation: { type: Object, required: true }
});

const { t } = useI18n();

const summary = computed(() => {
    const progress = props.operation.progress;
    return [
        { key: 'delivered', value: progress.delivered, tone: 'success' },
        { key: 'partially_delivered', value: progress.partiallyDelivered, tone: 'warning' },
        { key: 'not_delivered', value: progress.notDelivered, tone: 'danger' },
        { key: 'pending', value: progress.pending, tone: 'neutral' }
    ];
});
const completion = computed(() => {
    const { total } = props.operation.progress;
    return total === 0 ? 0 : Math.round((props.operation.registeredStopsCount / total) * 100);
});
</script>

<template>
    <section class="panel" aria-labelledby="operation-progress-title">
        <h2 id="operation-progress-title" class="operation-panel__title">{{ t('operations.detail.progress') }}</h2>
        <div
            class="operation-progress__bar"
            role="progressbar"
            :aria-valuenow="completion"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-label="t('operations.detail.progress')">
            <span class="operation-progress__fill" :style="{ width: `${completion}%` }"></span>
        </div>
        <p class="operation-progress__caption">{{ t('operations.detail.progress-caption', { registered: operation.registeredStopsCount, total: operation.progress.total }) }}</p>
        <dl class="operation-progress__summary">
            <div v-for="item in summary" :key="item.key" class="operation-progress__item" :class="`operation-progress__item--${item.tone}`">
                <dt>{{ t(`operations.delivery-statuses.${item.key}`) }}</dt>
                <dd>{{ item.value }}</dd>
            </div>
        </dl>
    </section>
</template>

<style scoped>
.operation-progress__bar {
    height: 0.5rem;
    overflow: hidden;
    border-radius: var(--radius-full);
    background: var(--fill-10);
}

.operation-progress__fill {
    display: block;
    height: 100%;
    background: var(--primary);
    transition: width var(--transition);
}

.operation-progress__caption {
    margin: 0;
    color: var(--ink-70);
    font-size: var(--text-sm);
}

.operation-progress__summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
    gap: var(--space-3);
    margin: 0;
}

.operation-progress__item {
    padding: var(--space-3);
    border-radius: var(--radius-md);
}

.operation-progress__item dt {
    font-size: var(--text-xs);
    font-weight: var(--weight-semibold);
}

.operation-progress__item dd {
    margin: var(--space-1) 0 0;
    font-size: var(--text-2xl);
    font-weight: var(--weight-bold);
}

.operation-progress__item--success {
    background: var(--success-soft);
    color: var(--success-strong);
}

.operation-progress__item--warning {
    background: var(--warning-soft);
    color: var(--warning-strong);
}

.operation-progress__item--danger {
    background: var(--danger-soft);
    color: var(--danger-strong);
}

.operation-progress__item--neutral {
    background: var(--fill-5);
    color: var(--foreground);
}
</style>
