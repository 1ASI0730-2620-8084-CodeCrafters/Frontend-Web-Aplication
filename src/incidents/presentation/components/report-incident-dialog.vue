<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import FormDialog from '../../../shared/presentation/components/form-dialog.vue';
import { INCIDENT_SEVERITIES, INCIDENT_TYPES } from '../../domain/model/incident.entity.js';

const props = defineProps({
    operations: { type: Array, required: true },
    isSaving: { type: Boolean, default: false }
});

const visible = defineModel('visible', { type: Boolean, default: false });
const emit = defineEmits(['submit']);
const { t } = useI18n();

const form = reactive({ transportOperationId: null, type: null, severity: 'medium', affectedQuantity: null, description: '' });
const wasSubmitted = ref(false);

const operationOptions = computed(() => props.operations.map(operation => ({ value: operation.id, label: `${operation.code} · ${operation.description}` })));
const typeOptions = computed(() => INCIDENT_TYPES.map(type => ({ value: type, label: t(`incidents.types.${type}`) })));
const severityOptions = computed(() => INCIDENT_SEVERITIES.map(severity => ({ value: severity, label: t(`incidents.severities.${severity}`) })));
const errors = computed(() => {
    const fieldErrors = {};
    ['transportOperationId', 'type', 'severity'].filter(field => !form[field]).forEach(field => { fieldErrors[field] = 'shared.form.required'; });
    if (!form.description.trim()) fieldErrors.description = 'shared.form.required';
    return fieldErrors;
});
const visibleErrors = computed(() => (wasSubmitted.value ? errors.value : {}));
const selectFields = computed(() => [
    { name: 'transportOperationId', label: 'incidents.form.operation', options: operationOptions.value },
    { name: 'type', label: 'incidents.form.type', options: typeOptions.value },
    { name: 'severity', label: 'incidents.form.severity', options: severityOptions.value }
]);

watch(visible, isVisible => {
    if (!isVisible) return;
    Object.assign(form, { transportOperationId: null, type: null, severity: 'medium', affectedQuantity: null, description: '' });
    wasSubmitted.value = false;
});

function submitIncident() {
    wasSubmitted.value = true;
    if (Object.keys(errors.value).length === 0) emit('submit', { ...form });
}
</script>

<template>
    <form-dialog v-model:visible="visible" form-id="report-incident-form" :header="t('incidents.form.title')" :submit-label="t('incidents.form.submit')" :is-saving="isSaving" @submit="submitIncident">
        <div v-for="field in selectFields" :key="field.name" class="form-field">
            <label class="form-field__label" :for="`incident-${field.name}`">{{ t(field.label) }}</label>
            <pv-select
                v-model="form[field.name]"
                :input-id="`incident-${field.name}`"
                :options="field.options"
                option-label="label"
                option-value="value"
                :placeholder="t('incidents.form.select')"
                :invalid="Boolean(visibleErrors[field.name])"
                :aria-describedby="visibleErrors[field.name] ? `incident-${field.name}-error` : undefined"
                fluid/>
            <small v-if="visibleErrors[field.name]" :id="`incident-${field.name}-error`" class="form-field__error">{{ t(visibleErrors[field.name]) }}</small>
        </div>
        <div class="form-field">
            <label class="form-field__label" for="incident-quantity">{{ t('incidents.form.affected-quantity') }}</label>
            <pv-input-number v-model="form.affectedQuantity" input-id="incident-quantity" :min="0" fluid/>
        </div>
        <div class="form-field report-incident__wide">
            <label class="form-field__label" for="incident-description">{{ t('incidents.form.description') }}</label>
            <pv-textarea
                id="incident-description"
                v-model="form.description"
                rows="3"
                maxlength="500"
                auto-resize
                :invalid="Boolean(visibleErrors.description)"
                :aria-describedby="visibleErrors.description ? 'incident-description-error' : undefined"
                fluid/>
            <small v-if="visibleErrors.description" id="incident-description-error" class="form-field__error">{{ t(visibleErrors.description) }}</small>
        </div>
    </form-dialog>
</template>

<style scoped>
.report-incident__wide {
    grid-column: 1 / -1;
}
</style>
