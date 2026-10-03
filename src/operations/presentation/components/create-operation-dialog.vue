<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import FormDialog from '../../../shared/presentation/components/form-dialog.vue';
import { toIsoDate } from '../../../shared/presentation/date-format.js';

defineProps({
    isSaving: { type: Boolean, default: false }
});

const visible = defineModel('visible', { type: Boolean, default: false });
const emit = defineEmits(['submit']);
const { t } = useI18n();

const today = new Date(new Date().setHours(0, 0, 0, 0));
const form = reactive({ description: '', scheduledDate: today });
const wasSubmitted = ref(false);

const errors = computed(() => {
    const fieldErrors = {};
    if (!form.description.trim()) fieldErrors.description = 'shared.form.required';
    if (!form.scheduledDate) fieldErrors.scheduledDate = 'shared.form.required';
    else if (form.scheduledDate < today) fieldErrors.scheduledDate = 'operations.create.date-in-past';
    return fieldErrors;
});
const visibleErrors = computed(() => (wasSubmitted.value ? errors.value : {}));

watch(visible, isVisible => {
    if (!isVisible) return;
    form.description = '';
    form.scheduledDate = today;
    wasSubmitted.value = false;
});

function submitOperation() {
    wasSubmitted.value = true;
    if (Object.keys(errors.value).length > 0) return;
    emit('submit', { description: form.description, scheduledDate: toIsoDate(form.scheduledDate) });
}
</script>

<template>
    <form-dialog
        v-model:visible="visible"
        form-id="create-operation-form"
        :header="t('operations.create.title')"
        :submit-label="t('operations.create.submit')"
        :is-saving="isSaving"
        @submit="submitOperation">
        <div class="form-field">
            <label class="form-field__label" for="operation-description">{{ t('operations.create.description') }}</label>
            <pv-input-text
                id="operation-description"
                v-model="form.description"
                :placeholder="t('operations.create.description-placeholder')"
                :invalid="Boolean(visibleErrors.description)"
                :aria-describedby="visibleErrors.description ? 'operation-description-error' : undefined"
                fluid/>
            <small v-if="visibleErrors.description" id="operation-description-error" class="form-field__error">{{ t(visibleErrors.description) }}</small>
        </div>
        <div class="form-field">
            <label class="form-field__label" for="operation-date">{{ t('operations.create.scheduled-date') }}</label>
            <pv-date-picker
                v-model="form.scheduledDate"
                input-id="operation-date"
                :min-date="today"
                date-format="yy-mm-dd"
                show-icon
                :invalid="Boolean(visibleErrors.scheduledDate)"
                :aria-describedby="visibleErrors.scheduledDate ? 'operation-date-error' : undefined"
                fluid/>
            <small v-if="visibleErrors.scheduledDate" id="operation-date-error" class="form-field__error">{{ t(visibleErrors.scheduledDate) }}</small>
        </div>
    </form-dialog>
</template>
