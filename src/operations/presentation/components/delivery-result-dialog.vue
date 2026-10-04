<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import FormDialog from '../../../shared/presentation/components/form-dialog.vue';
import { DELIVERY_STATUSES } from '../../domain/model/delivery-status.js';

const RESULT_STATUSES = [DELIVERY_STATUSES.DELIVERED, DELIVERY_STATUSES.PARTIALLY_DELIVERED, DELIVERY_STATUSES.NOT_DELIVERED];

const props = defineProps({
    stop: { type: Object, default: null },
    isSaving: { type: Boolean, default: false }
});

const visible = defineModel('visible', { type: Boolean, default: false });
const emit = defineEmits(['submit']);
const { t } = useI18n();

const form = reactive({ status: DELIVERY_STATUSES.DELIVERED, deliveredQuantity: null, failureReason: '' });
const wasSubmitted = ref(false);

const statusOptions = computed(() => RESULT_STATUSES.map(status => ({ value: status, label: t(`operations.delivery-statuses.${status}`) })));
const isPartial = computed(() => form.status === DELIVERY_STATUSES.PARTIALLY_DELIVERED);
const needsReason = computed(() => form.status !== DELIVERY_STATUSES.DELIVERED);
const errors = computed(() => {
    const fieldErrors = {};
    const planned = props.stop?.plannedQuantity ?? 0;
    if (isPartial.value && !(form.deliveredQuantity > 0 && form.deliveredQuantity < planned)) fieldErrors.deliveredQuantity = 'operations.result-form.partial-quantity-invalid';
    if (needsReason.value && !form.failureReason.trim()) fieldErrors.failureReason = 'operations.result-form.reason-required';
    return fieldErrors;
});
const visibleErrors = computed(() => (wasSubmitted.value ? errors.value : {}));

watch(visible, isVisible => {
    if (!isVisible) return;
    Object.assign(form, { status: DELIVERY_STATUSES.DELIVERED, deliveredQuantity: null, failureReason: '' });
    wasSubmitted.value = false;
});

function submitResult() {
    wasSubmitted.value = true;
    if (Object.keys(errors.value).length === 0) emit('submit', { ...form });
}
</script>

<template>
    <form-dialog v-model:visible="visible" form-id="delivery-result-form" :header="t('operations.result-form.title')" :is-saving="isSaving" @submit="submitResult">
        <p v-if="stop" class="delivery-result__context">{{ stop.deliveryPointName }} &middot; {{ t('operations.route.boxes', { quantity: stop.plannedQuantity }) }}</p>
        <fieldset class="form-field delivery-result__statuses">
            <legend class="form-field__label">{{ t('operations.result-form.result') }}</legend>
            <pv-select-button v-model="form.status" :options="statusOptions" option-label="label" option-value="value" :allow-empty="false"/>
        </fieldset>
        <div v-if="isPartial" class="form-field">
            <label class="form-field__label" for="result-quantity">{{ t('operations.result-form.delivered-quantity') }}</label>
            <pv-input-number
                v-model="form.deliveredQuantity"
                input-id="result-quantity"
                :min="1"
                :max="stop ? stop.plannedQuantity - 1 : undefined"
                :invalid="Boolean(visibleErrors.deliveredQuantity)"
                :aria-describedby="visibleErrors.deliveredQuantity ? 'result-quantity-error' : undefined"
                fluid/>
            <small v-if="visibleErrors.deliveredQuantity" id="result-quantity-error" class="form-field__error">{{ t(visibleErrors.deliveredQuantity) }}</small>
        </div>
        <div v-if="needsReason" class="form-field delivery-result__wide">
            <label class="form-field__label" for="result-reason">{{ t('operations.result-form.reason') }}</label>
            <pv-textarea
                id="result-reason"
                v-model="form.failureReason"
                rows="3"
                maxlength="255"
                auto-resize
                :invalid="Boolean(visibleErrors.failureReason)"
                :aria-describedby="visibleErrors.failureReason ? 'result-reason-error' : undefined"
                fluid/>
            <small v-if="visibleErrors.failureReason" id="result-reason-error" class="form-field__error">{{ t(visibleErrors.failureReason) }}</small>
        </div>
    </form-dialog>
</template>

<style scoped>
.delivery-result__context {
    grid-column: 1 / -1;
    margin: 0;
    color: var(--ink-70);
    font-size: var(--text-sm);
}

.delivery-result__statuses {
    grid-column: 1 / -1;
    margin: 0;
    padding: 0;
    border: none;
}

.delivery-result__wide {
    grid-column: 1 / -1;
}
</style>
