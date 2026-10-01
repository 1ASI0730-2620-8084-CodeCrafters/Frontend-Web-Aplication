<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import FormDialog from '../../../shared/presentation/components/form-dialog.vue';
import { Driver, DRIVER_STATUSES, DOCUMENT_NUMBER_PATTERN, LICENSE_NUMBER_PATTERN } from '../../domain/model/driver.entity.js';

const TEXT_FIELDS = [
    { name: 'firstName', autocomplete: 'off' },
    { name: 'lastName', autocomplete: 'off' },
    { name: 'documentNumber', autocomplete: 'off', placeholder: '45678912' },
    { name: 'licenseNumber', autocomplete: 'off', placeholder: 'Q45678912' },
    { name: 'phone', autocomplete: 'off', placeholder: '+51 987 654 321', optional: true }
];

const props = defineProps({
    driver: { type: Object, default: null },
    organizationId: { type: String, default: null },
    isSaving: { type: Boolean, default: false },
    serverError: { type: String, default: null }
});

const visible = defineModel('visible', { type: Boolean, default: false });
const emit = defineEmits(['submit']);
const { t } = useI18n();

const form = reactive({ firstName: '', lastName: '', documentNumber: '', licenseNumber: '', phone: '', status: DRIVER_STATUSES.AVAILABLE });
const wasSubmitted = ref(false);
const submittedValues = ref({});

const isAssigned = computed(() => props.driver?.status === DRIVER_STATUSES.ASSIGNED);
const statusOptions = computed(() => [DRIVER_STATUSES.AVAILABLE, DRIVER_STATUSES.INACTIVE]
    .map(status => ({ value: status, label: t(`fleet.driver-statuses.${status}`) })));
const errors = computed(() => {
    const fieldErrors = {};
    TEXT_FIELDS.filter(field => !field.optional && !form[field.name].trim())
        .forEach(field => { fieldErrors[field.name] = 'shared.form.required'; });
    if (!fieldErrors.documentNumber && !DOCUMENT_NUMBER_PATTERN.test(form.documentNumber.trim())) fieldErrors.documentNumber = 'fleet.driver-form.document-number-invalid';
    if (!fieldErrors.licenseNumber && !LICENSE_NUMBER_PATTERN.test(form.licenseNumber.trim().toUpperCase())) fieldErrors.licenseNumber = 'fleet.driver-form.license-number-invalid';
    for (const field of ['documentNumber', 'licenseNumber']) {
        const isSameValue = form[field].trim().toUpperCase() === submittedValues.value[field];
        if (!fieldErrors[field] && props.serverError === `${field}-taken` && isSameValue) fieldErrors[field] = `fleet.driver-form.${field}-taken`;
    }
    return fieldErrors;
});
const visibleErrors = computed(() => (wasSubmitted.value ? errors.value : {}));

watch(visible, isVisible => {
    if (!isVisible) return;
    TEXT_FIELDS.forEach(field => { form[field.name] = props.driver?.[field.name] ?? ''; });
    form.status = props.driver?.status ?? DRIVER_STATUSES.AVAILABLE;
    wasSubmitted.value = false;
});

function submitDriver() {
    wasSubmitted.value = true;
    submittedValues.value = {};
    if (Object.keys(errors.value).length > 0) return;
    submittedValues.value = { documentNumber: form.documentNumber.trim(), licenseNumber: form.licenseNumber.trim().toUpperCase() };
    emit('submit', new Driver({ ...props.driver, ...form, organizationId: props.driver?.organizationId ?? props.organizationId }));
}
</script>

<template>
    <form-dialog
        v-model:visible="visible"
        form-id="driver-form"
        :header="t(driver ? 'fleet.driver-form.edit-title' : 'fleet.driver-form.new-title')"
        :is-saving="isSaving"
        @submit="submitDriver">
        <div v-for="field in TEXT_FIELDS" :key="field.name" class="form-field">
            <label class="form-field__label" :for="`driver-${field.name}`">{{ t(`fleet.driver-form.${field.name}`) }}</label>
            <pv-input-text
                :id="`driver-${field.name}`"
                v-model="form[field.name]"
                :placeholder="field.placeholder"
                :autocomplete="field.autocomplete"
                :invalid="Boolean(visibleErrors[field.name])"
                :aria-describedby="visibleErrors[field.name] ? `driver-${field.name}-error` : undefined"
                fluid/>
            <small v-if="visibleErrors[field.name]" :id="`driver-${field.name}-error`" class="form-field__error">{{ t(visibleErrors[field.name]) }}</small>
        </div>
        <div v-if="!isAssigned" class="form-field">
            <label class="form-field__label" for="driver-status">{{ t('fleet.driver-form.status') }}</label>
            <pv-select v-model="form.status" input-id="driver-status" :options="statusOptions" option-label="label" option-value="value" fluid/>
        </div>
    </form-dialog>
</template>
