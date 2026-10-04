<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import useTransportOperationsStore from '../../application/transport-operations.store.js';
import { AddDeliveryStopCommand, RecordDeliveryCommand } from '../../domain/model/operation-commands.js';
import StatusBadge from '../../../shared/presentation/components/status-badge.vue';
import AddStopDialog from './add-stop-dialog.vue';
import DeliveryResultDialog from './delivery-result-dialog.vue';
import { DELIVERY_STATUS_TONES } from '../status-tones.js';

const props = defineProps({
    operation: { type: Object, required: true }
});

const emit = defineEmits(['result']);
const { t } = useI18n();
const store = useTransportOperationsStore();

const isAddStopVisible = ref(false);
const isResultVisible = ref(false);
const selectedStop = ref(null);

const usedDeliveryPointIds = computed(() => props.operation.stops.map(stop => stop.deliveryPointId));

function mapUrl(stop) {
    return `https://www.google.com/maps/search/?api=1&query=${stop.latitude},${stop.longitude}`;
}

async function moveStop(stop, offset) {
    const error = await store.moveStop(props.operation, stop, offset);
    if (error) emit('result', error, null);
}

function openResultDialog(stop) {
    selectedStop.value = stop;
    isResultVisible.value = true;
}

async function addStop(formValues) {
    const error = await store.addDeliveryStop(new AddDeliveryStopCommand({ operation: props.operation, ...formValues }));
    if (!error) isAddStopVisible.value = false;
    emit('result', error, 'operations.route.stop-added');
}

async function recordResult(formValues) {
    const error = await store.recordDelivery(props.operation, new RecordDeliveryCommand({ stop: selectedStop.value, ...formValues }));
    if (!error) isResultVisible.value = false;
    emit('result', error, 'operations.route.result-recorded');
}
</script>

<template>
    <section class="panel panel--table" aria-labelledby="operation-route-title">
        <div class="operation-route__header">
            <h2 id="operation-route-title" class="operation-panel__title">{{ t('operations.route.title') }}</h2>
            <pv-button
                v-if="operation.isPending"
                :label="t('operations.route.add')"
                icon="pi pi-plus"
                size="small"
                outlined
                @click="isAddStopVisible = true"/>
        </div>
        <pv-data-table :value="operation.stops" data-key="id" scrollable>
            <template #empty>{{ t('operations.route.empty') }}</template>
            <pv-column field="sequenceNumber" header="#"/>
            <pv-column :header="t('operations.route.delivery-point')">
                <template #body="{ data }">
                    <div class="operation-route__point">
                        <strong>{{ data.deliveryPointName }}</strong>
                        <span>{{ data.deliveryPointAddress }} &middot; {{ data.deliveryPointDistrict }}</span>
                        <a
                            v-if="data.hasLocation"
                            :href="mapUrl(data)"
                            target="_blank"
                            rel="noopener noreferrer"
                            :aria-label="t('operations.route.map-for', { name: data.deliveryPointName })">
                            <i class="pi pi-map-marker" aria-hidden="true"></i> {{ t('operations.route.map') }}
                        </a>
                    </div>
                </template>
            </pv-column>
            <pv-column :header="t('operations.route.quantity')">
                <template #body="{ data }">
                    <span v-if="data.isPending">{{ data.plannedQuantity }}</span>
                    <span v-else>{{ data.deliveredQuantity ?? 0 }} / {{ data.plannedQuantity }}</span>
                </template>
            </pv-column>
            <pv-column :header="t('operations.route.status')">
                <template #body="{ data }">
                    <status-badge :label="t(`operations.delivery-statuses.${data.status}`)" :tone="DELIVERY_STATUS_TONES[data.status]"/>
                </template>
            </pv-column>
            <pv-column field="failureReason" :header="t('operations.route.reason')"/>
            <pv-column v-if="operation.isPending && operation.stops.length > 1" :header="t('operations.route.order')">
                <template #body="{ data, index }">
                    <div class="operation-route__order">
                        <pv-button icon="pi pi-arrow-up" text rounded size="small" :disabled="index === 0 || store.isSaving" :aria-label="t('operations.route.move-up', { name: data.deliveryPointName })" @click="moveStop(data, -1)"/>
                        <pv-button icon="pi pi-arrow-down" text rounded size="small" :disabled="index === operation.stops.length - 1 || store.isSaving" :aria-label="t('operations.route.move-down', { name: data.deliveryPointName })" @click="moveStop(data, 1)"/>
                    </div>
                </template>
            </pv-column>
            <pv-column v-if="operation.isInProgress" :header="t('shared.actions')">
                <template #body="{ data }">
                    <pv-button
                        v-if="data.isPending"
                        :label="t('operations.route.record')"
                        size="small"
                        text
                        :aria-label="t('operations.route.record-for', { name: data.deliveryPointName })"
                        @click="openResultDialog(data)"/>
                </template>
            </pv-column>
        </pv-data-table>
        <add-stop-dialog
            v-model:visible="isAddStopVisible"
            :delivery-points="store.deliveryPoints"
            :used-delivery-point-ids="usedDeliveryPointIds"
            :is-saving="store.isSaving"
            @submit="addStop"/>
        <delivery-result-dialog v-model:visible="isResultVisible" :stop="selectedStop" :is-saving="store.isSaving" @submit="recordResult"/>
    </section>
</template>

<style scoped>
.operation-route__point {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
}

.operation-route__point span {
    color: var(--ink-70);
    font-size: var(--text-sm);
}

.operation-route__point a {
    color: var(--primary-mid);
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
}

.operation-route__order {
    display: flex;
}

.operation-route__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-5) var(--space-5) var(--space-3);
}
</style>
