<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import FormDialog from '../../../shared/presentation/components/form-dialog.vue';
import { SafeRange } from '../../domain/model/iot-device.entity.js';

const FIELDS = [
    { name: 'safeTemperatureMin', suffix: ' °C', step: 0.5, min: -30 },
    { name: 'safeTemperatureMax', suffix: ' °C', step: 0.5, min: -30 },
    { name: 'impactThreshold', suffix: ' g', step: 0.1, min: 0.1 }
];

const props = defineProps({
    device: { type: Object, default: null },
    isSaving: { type: Boolean, default: false }
});

const visible = defineModel('visible', { type: Boolean, default: false });
const emit = defineEmits(['submit']);
const { t } = useI18n();

const form = reactive({ safeTemperatureMin: null, safeTemperatureMax: null, impactThreshold: null });
const wasSubmitted = ref(false);

const errorKey = computed(() => new SafeRange(form).validationError);
const showError = computed(() => wasSubmitted.value && errorKey.value !== null);

watch(visible, isVisible => {
    if (!isVisible || !props.device) return;
    FIELDS.forEach(field => { form[field.name] = props.device[field.name]; });
    wasSubmitted.value = false;
});

function submitRange() {
    wasSubmitted.value = true;
    if (!errorKey.value) emit('submit', new SafeRange(form));
}
</script>

<template>
    <form-dialog
        v-model:visible="visible"
        form-id="safe-range-form"
        :header="t('monitoring.devices.dialog-title', { serial: device?.serialNumber ?? '' })"
        :is-saving="isSaving"
        @submit="submitRange">
        <div v-for="field in FIELDS" :key="field.name" class="form-field">
            <label class="form-field__label" :for="`range-${field.name}`">{{ t(`monitoring.devices.${field.name}`) }}</label>
            <pv-input-number
                v-model="form[field.name]"
                :input-id="`range-${field.name}`"
                :suffix="field.suffix"
                :step="field.step"
                :min="field.min"
                :min-fraction-digits="0"
                :max-fraction-digits="1"
                :invalid="showError"
                :aria-describedby="showError ? 'safe-range-error' : undefined"
                show-buttons
                fluid/>
        </div>
        <small v-if="showError" id="safe-range-error" class="form-field__error safe-range__error" role="alert">{{ t(`monitoring.devices.errors.${errorKey}`) }}</small>
    </form-dialog>
</template>

<style scoped>
.safe-range__error {
    grid-column: 1 / -1;
}
</style>
