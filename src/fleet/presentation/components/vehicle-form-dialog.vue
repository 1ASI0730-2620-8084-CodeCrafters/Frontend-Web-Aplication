<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import FormDialog from '../../../shared/presentation/components/form-dialog.vue';
import { PLATE_NUMBER_PATTERN, Vehicle, VEHICLE_STATUSES } from '../../domain/model/vehicle.entity.js';

const props = defineProps({
    vehicle: { type: Object, default: null },
    organizationId: { type: String, default: null },
    isSaving: { type: Boolean, default: false },
    serverError: { type: String, default: null }
});

const visible = defineModel('visible', { type: Boolean, default: false });
const emit = defineEmits(['submit']);
const { t } = useI18n();

const form = reactive({ plateNumber: '', brand: '', model: '', capacityInBoxes: null, status: VEHICLE_STATUSES.AVAILABLE });
const wasSubmitted = ref(false);
const submittedPlateNumber = ref('');

const isAssigned = computed(() => props.vehicle?.status === VEHICLE_STATUSES.ASSIGNED);
const statusOptions = computed(() => [VEHICLE_STATUSES.AVAILABLE, VEHICLE_STATUSES.IN_MAINTENANCE]
    .map(status => ({ value: status, label: t(`fleet.vehicle-statuses.${status}`) })));
const errors = computed(() => {
    const fieldErrors = {};
    const plateNumber = form.plateNumber.trim().toUpperCase();
    if (!plateNumber) fieldErrors.plateNumber = 'shared.form.required';
    else if (!PLATE_NUMBER_PATTERN.test(plateNumber)) fieldErrors.plateNumber = 'fleet.vehicle-form.plate-number-invalid';
    else if (props.serverError === 'plate-number-taken' && plateNumber === submittedPlateNumber.value) fieldErrors.plateNumber = 'fleet.vehicle-form.plate-number-taken';
    if (!form.brand.trim()) fieldErrors.brand = 'shared.form.required';
    if (!form.model.trim()) fieldErrors.model = 'shared.form.required';
    if (!(form.capacityInBoxes > 0)) fieldErrors.capacityInBoxes = 'fleet.vehicle-form.capacity-invalid';
    return fieldErrors;
});
const visibleErrors = computed(() => (wasSubmitted.value ? errors.value : {}));

watch(visible, isVisible => {
    if (!isVisible) return;
    Object.assign(form, {
        plateNumber: props.vehicle?.plateNumber ?? '',
        brand: props.vehicle?.brand ?? '',
        model: props.vehicle?.model ?? '',
        capacityInBoxes: props.vehicle?.capacityInBoxes ?? null,
        status: props.vehicle?.status ?? VEHICLE_STATUSES.AVAILABLE
    });
    wasSubmitted.value = false;
});

function submitVehicle() {
    wasSubmitted.value = true;
    submittedPlateNumber.value = '';
    if (Object.keys(errors.value).length > 0) return;
    submittedPlateNumber.value = form.plateNumber.trim().toUpperCase();
    emit('submit', new Vehicle({ ...props.vehicle, ...form, organizationId: props.vehicle?.organizationId ?? props.organizationId }));
}
</script>

<template>
    <form-dialog
        v-model:visible="visible"
        form-id="vehicle-form"
        :header="t(vehicle ? 'fleet.vehicle-form.edit-title' : 'fleet.vehicle-form.new-title')"
        :is-saving="isSaving"
        @submit="submitVehicle">
        <div v-for="field in ['plateNumber', 'brand', 'model']" :key="field" class="form-field">
            <label class="form-field__label" :for="`vehicle-${field}`">{{ t(`fleet.vehicle-form.${field}`) }}</label>
            <pv-input-text
                :id="`vehicle-${field}`"
                v-model="form[field]"
                :placeholder="field === 'plateNumber' ? 'ABC-123' : undefined"
                :invalid="Boolean(visibleErrors[field])"
                :aria-describedby="visibleErrors[field] ? `vehicle-${field}-error` : undefined"
                fluid/>
            <small v-if="visibleErrors[field]" :id="`vehicle-${field}-error`" class="form-field__error">{{ t(visibleErrors[field]) }}</small>
        </div>
        <div class="form-field">
            <label class="form-field__label" for="vehicle-capacity">{{ t('fleet.vehicle-form.capacityInBoxes') }}</label>
            <pv-input-number
                v-model="form.capacityInBoxes"
                input-id="vehicle-capacity"
                :min="1"
                :invalid="Boolean(visibleErrors.capacityInBoxes)"
                :aria-describedby="visibleErrors.capacityInBoxes ? 'vehicle-capacity-error' : undefined"
                fluid/>
            <small v-if="visibleErrors.capacityInBoxes" id="vehicle-capacity-error" class="form-field__error">{{ t(visibleErrors.capacityInBoxes) }}</small>
        </div>
        <div v-if="!isAssigned" class="form-field">
            <label class="form-field__label" for="vehicle-status">{{ t('fleet.vehicle-form.status') }}</label>
            <pv-select v-model="form.status" input-id="vehicle-status" :options="statusOptions" option-label="label" option-value="value" fluid/>
        </div>
    </form-dialog>
</template>
