<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    operation: { type: Object, required: true },
    availableVehicles: { type: Array, required: true },
    availableDrivers: { type: Array, required: true },
    isSaving: { type: Boolean, default: false }
});

const emit = defineEmits(['assign-vehicle', 'assign-driver']);
const { t } = useI18n();

const vehicleOptions = computed(() => props.availableVehicles.map(vehicle => ({
    value: vehicle.id,
    label: `${vehicle.plateNumber} · ${vehicle.brand} ${vehicle.model} (${vehicle.capacityInBoxes})`
})));
const driverOptions = computed(() => props.availableDrivers.map(driver => ({
    value: driver.id,
    label: `${driver.firstName} ${driver.lastName}`
})));
</script>

<template>
    <section class="panel" aria-labelledby="operation-resources-title">
        <h2 id="operation-resources-title" class="operation-panel__title">{{ t('operations.detail.resources') }}</h2>
        <div class="form-grid">
            <div class="form-field">
                <span id="operation-vehicle-label" class="form-field__label">{{ t('operations.detail.vehicle') }}</span>
                <span class="operation-resources__value">{{ operation.vehicleLabel || t('operations.list.unassigned') }}</span>
                <pv-select
                    v-if="operation.isPending"
                    :options="vehicleOptions"
                    option-label="label"
                    option-value="value"
                    :placeholder="t(operation.vehicleId ? 'operations.detail.change-vehicle' : 'operations.detail.assign-vehicle')"
                    :empty-message="t('operations.detail.no-available-vehicles')"
                    :disabled="isSaving"
                    aria-labelledby="operation-vehicle-label"
                    fluid
                    @update:model-value="vehicleId => emit('assign-vehicle', vehicleId)"/>
            </div>
            <div class="form-field">
                <span id="operation-driver-label" class="form-field__label">{{ t('operations.detail.driver') }}</span>
                <span class="operation-resources__value">{{ operation.driverName || t('operations.list.unassigned') }}</span>
                <pv-select
                    v-if="operation.isPending"
                    :options="driverOptions"
                    option-label="label"
                    option-value="value"
                    :placeholder="t(operation.driverId ? 'operations.detail.change-driver' : 'operations.detail.assign-driver')"
                    :empty-message="t('operations.detail.no-available-drivers')"
                    :disabled="isSaving"
                    aria-labelledby="operation-driver-label"
                    fluid
                    @update:model-value="driverId => emit('assign-driver', driverId)"/>
            </div>
        </div>
    </section>
</template>

<style scoped>
.operation-resources__value {
    font-weight: var(--weight-medium);
}
</style>
