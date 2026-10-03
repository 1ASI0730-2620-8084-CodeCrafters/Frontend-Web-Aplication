<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import StatusBadge from '../../../shared/presentation/components/status-badge.vue';
import { formatDateTime } from '../../../shared/presentation/date-format.js';
import { OFFLINE_THRESHOLD_MINUTES } from '../../domain/model/iot-device.entity.js';

const props = defineProps({
    monitoredOperation: { type: Object, required: true },
    isSaving: { type: Boolean, default: false }
});

const emit = defineEmits(['simulate']);
const { t, locale } = useI18n();

const titleId = computed(() => `monitored-${props.monitoredOperation.operationId}`);
const reading = computed(() => props.monitoredOperation.latestReading);
const device = computed(() => props.monitoredOperation.device);
const isTemperatureSafe = computed(() => device.value.isTemperatureSafe(reading.value.temperatureCelsius));
const isOffline = computed(() => props.monitoredOperation.isOffline());
const isImpactSafe = computed(() => device.value.isImpactSafe(reading.value.impactForce));
</script>

<template>
    <article class="panel monitored-card" :aria-labelledby="titleId">
        <header class="monitored-card__header">
            <div>
                <h2 :id="titleId" class="monitored-card__title">{{ monitoredOperation.operationCode }}</h2>
                <p class="monitored-card__meta">{{ monitoredOperation.description }} &middot; {{ monitoredOperation.vehiclePlateNumber }}</p>
            </div>
            <status-badge v-if="isOffline" :label="t('monitoring.offline')" tone="warning"/>
            <status-badge
                v-else-if="monitoredOperation.hasDevice && reading"
                :label="t(monitoredOperation.isCargoSafe ? 'monitoring.cargo-safe' : 'monitoring.cargo-at-risk')"
                :tone="monitoredOperation.isCargoSafe ? 'success' : 'danger'"/>
        </header>
        <p v-if="isOffline" class="monitored-card__offline" role="status">
            <i class="pi pi-wifi" aria-hidden="true"></i>
            {{ t('monitoring.offline-detail', { minutes: OFFLINE_THRESHOLD_MINUTES }) }}
        </p>
        <p v-if="!monitoredOperation.hasDevice" class="monitored-card__empty">{{ t('monitoring.no-device') }}</p>
        <p v-else-if="!reading" class="monitored-card__empty">{{ t('monitoring.no-readings', { serial: device.serialNumber }) }}</p>
        <dl v-else class="monitored-card__readings">
            <div class="monitored-card__reading" :class="{ 'monitored-card__reading--risk': !isTemperatureSafe }">
                <dt>{{ t('monitoring.temperature') }}</dt>
                <dd>{{ reading.temperatureCelsius }} °C</dd>
                <small>{{ t('monitoring.safe-range', { min: device.safeTemperatureMin, max: device.safeTemperatureMax }) }}</small>
            </div>
            <div class="monitored-card__reading" :class="{ 'monitored-card__reading--risk': !isImpactSafe }">
                <dt>{{ t('monitoring.impact') }}</dt>
                <dd>{{ reading.impactForce }} g</dd>
                <small>{{ t('monitoring.threshold', { value: device.impactThreshold }) }}</small>
            </div>
            <div class="monitored-card__reading">
                <dt>{{ t('monitoring.location') }}</dt>
                <dd class="monitored-card__coordinates">{{ reading.latitude }}, {{ reading.longitude }}</dd>
                <small>{{ device.serialNumber }}</small>
            </div>
        </dl>
        <footer class="monitored-card__footer">
            <span v-if="reading" class="monitored-card__time">{{ t('monitoring.recorded-at', { date: formatDateTime(reading.recordedAt, locale) }) }}</span>
            <pv-button
                v-if="monitoredOperation.hasDevice"
                :label="t('monitoring.simulate')"
                icon="pi pi-wifi"
                size="small"
                outlined
                :loading="isSaving"
                @click="emit('simulate', monitoredOperation)"/>
        </footer>
    </article>
</template>

<style scoped>
.monitored-card__header,
.monitored-card__footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
}

.monitored-card__title {
    font-size: var(--text-lg);
}

.monitored-card__meta,
.monitored-card__empty,
.monitored-card__time {
    margin: 0;
    color: var(--ink-70);
    font-size: var(--text-sm);
}

.monitored-card__offline {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin: 0;
    padding: var(--space-3);
    border-radius: var(--radius-md);
    background: var(--warning-soft);
    color: var(--warning-strong);
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
}

.monitored-card__readings {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
    gap: var(--space-3);
    margin: 0;
}

.monitored-card__reading {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    padding: var(--space-3);
    border-radius: var(--radius-md);
    background: var(--fill-5);
}

.monitored-card__reading--risk {
    background: var(--danger-soft);
    color: var(--danger-strong);
}

.monitored-card__reading dt,
.monitored-card__reading small {
    font-size: var(--text-xs);
    font-weight: var(--weight-semibold);
}

.monitored-card__reading dd {
    margin: 0;
    font-size: var(--text-xl);
    font-weight: var(--weight-bold);
}

.monitored-card__coordinates {
    font-size: var(--text-sm) !important;
    overflow-wrap: anywhere;
}
</style>
