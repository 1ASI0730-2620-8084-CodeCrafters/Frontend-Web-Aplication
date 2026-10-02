<script setup>
import { useI18n } from 'vue-i18n';
import { formatDateTime } from '../../../shared/presentation/date-format.js';

defineProps({
    alerts: { type: Array, required: true }
});

const emit = defineEmits(['acknowledge', 'report-incident']);
const { t, locale } = useI18n();
</script>

<template>
    <section class="panel alert-list" aria-labelledby="alert-list-title" aria-live="polite">
        <h2 id="alert-list-title" class="alert-list__title">{{ t('monitoring.alerts.title', { count: alerts.length }) }}</h2>
        <p v-if="alerts.length === 0" class="alert-list__empty">{{ t('monitoring.alerts.empty') }}</p>
        <ul v-else class="alert-list__items">
            <li v-for="alert in alerts" :key="alert.id" class="alert-list__item">
                <i class="pi pi-exclamation-triangle alert-list__icon" aria-hidden="true"></i>
                <div class="alert-list__body">
                    <strong>{{ t(`monitoring.alert-types.${alert.type}`) }}</strong>
                    <span>{{ alert.operationCode }} &middot; {{ formatDateTime(alert.raisedAt, locale) }}</span>
                </div>
                <pv-button
                    :label="t('monitoring.alerts.report-incident')"
                    icon="pi pi-flag"
                    size="small"
                    severity="danger"
                    text
                    :aria-label="t('monitoring.alerts.report-incident-for', { type: t(`monitoring.alert-types.${alert.type}`), code: alert.operationCode })"
                    @click="emit('report-incident', alert)"/>
                <pv-button
                    :label="t('monitoring.alerts.acknowledge')"
                    size="small"
                    text
                    :aria-label="t('monitoring.alerts.acknowledge-for', { type: t(`monitoring.alert-types.${alert.type}`), code: alert.operationCode })"
                    @click="emit('acknowledge', alert)"/>
            </li>
        </ul>
    </section>
</template>

<style scoped>
.alert-list__title {
    font-size: var(--text-lg);
}

.alert-list__empty {
    margin: 0;
    color: var(--ink-70);
    font-size: var(--text-sm);
}

.alert-list__items {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin: 0;
    padding: 0;
    list-style: none;
}

.alert-list__item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    border-radius: var(--radius-md);
    background: var(--danger-soft);
    color: var(--danger-strong);
}

.alert-list__icon {
    font-size: var(--text-lg);
}

.alert-list__item {
    flex-wrap: wrap;
}

.alert-list__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    font-size: var(--text-sm);
}
</style>
