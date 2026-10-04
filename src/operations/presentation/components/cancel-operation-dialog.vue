<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import FormDialog from '../../../shared/presentation/components/form-dialog.vue';

const props = defineProps({
    operation: { type: Object, default: null },
    isSaving: { type: Boolean, default: false }
});

const visible = defineModel('visible', { type: Boolean, default: false });
const emit = defineEmits(['submit']);
const { t } = useI18n();

const reason = ref('');
const wasSubmitted = ref(false);

const showReasonError = computed(() => wasSubmitted.value && !reason.value.trim());

watch(visible, isVisible => {
    if (!isVisible) return;
    reason.value = '';
    wasSubmitted.value = false;
});

function submitCancellation() {
    wasSubmitted.value = true;
    if (!showReasonError.value) emit('submit', reason.value);
}
</script>

<template>
    <form-dialog
        v-model:visible="visible"
        form-id="cancel-operation-form"
        :header="t('operations.cancel.title', { code: props.operation?.code ?? '' })"
        :submit-label="t('operations.cancel.submit')"
        :is-saving="isSaving"
        @submit="submitCancellation">
        <p class="cancel-operation__warning">{{ t('operations.cancel.warning') }}</p>
        <div class="form-field cancel-operation__wide">
            <label class="form-field__label" for="cancel-reason">{{ t('operations.cancel.reason') }}</label>
            <pv-textarea
                id="cancel-reason"
                v-model="reason"
                rows="3"
                maxlength="255"
                auto-resize
                :invalid="showReasonError"
                :aria-describedby="showReasonError ? 'cancel-reason-error' : undefined"
                fluid/>
            <small v-if="showReasonError" id="cancel-reason-error" class="form-field__error">{{ t('operations.cancel.reason-required') }}</small>
        </div>
    </form-dialog>
</template>

<style scoped>
.cancel-operation__warning {
    grid-column: 1 / -1;
    margin: 0;
    color: var(--ink-70);
}

.cancel-operation__wide {
    grid-column: 1 / -1;
}
</style>
