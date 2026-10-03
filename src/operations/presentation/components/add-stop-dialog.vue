<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import FormDialog from '../../../shared/presentation/components/form-dialog.vue';

const props = defineProps({
    deliveryPoints: { type: Array, required: true },
    usedDeliveryPointIds: { type: Array, default: () => [] },
    isSaving: { type: Boolean, default: false }
});

const visible = defineModel('visible', { type: Boolean, default: false });
const emit = defineEmits(['submit']);
const { t } = useI18n();

const form = reactive({ deliveryPointId: null, plannedQuantity: null });
const wasSubmitted = ref(false);

const pointOptions = computed(() => props.deliveryPoints
    .filter(point => !props.usedDeliveryPointIds.includes(point.id))
    .map(point => ({ value: point.id, label: `${point.businessName} · ${point.district}` })));
const errors = computed(() => {
    const fieldErrors = {};
    if (!form.deliveryPointId) fieldErrors.deliveryPointId = 'shared.form.required';
    if (!(form.plannedQuantity > 0)) fieldErrors.plannedQuantity = 'operations.stop-form.quantity-invalid';
    return fieldErrors;
});
const visibleErrors = computed(() => (wasSubmitted.value ? errors.value : {}));

watch(visible, isVisible => {
    if (!isVisible) return;
    form.deliveryPointId = null;
    form.plannedQuantity = null;
    wasSubmitted.value = false;
});

function submitStop() {
    wasSubmitted.value = true;
    if (Object.keys(errors.value).length === 0) emit('submit', { ...form });
}
</script>

<template>
    <form-dialog v-model:visible="visible" form-id="add-stop-form" :header="t('operations.stop-form.title')" :is-saving="isSaving" @submit="submitStop">
        <div class="form-field">
            <label class="form-field__label" for="stop-point">{{ t('operations.stop-form.delivery-point') }}</label>
            <pv-select
                v-model="form.deliveryPointId"
                input-id="stop-point"
                :options="pointOptions"
                option-label="label"
                option-value="value"
                :placeholder="t('operations.stop-form.delivery-point-placeholder')"
                :empty-message="t('operations.stop-form.no-points')"
                filter
                :invalid="Boolean(visibleErrors.deliveryPointId)"
                :aria-describedby="visibleErrors.deliveryPointId ? 'stop-point-error' : undefined"
                fluid/>
            <small v-if="visibleErrors.deliveryPointId" id="stop-point-error" class="form-field__error">{{ t(visibleErrors.deliveryPointId) }}</small>
        </div>
        <div class="form-field">
            <label class="form-field__label" for="stop-quantity">{{ t('operations.stop-form.planned-quantity') }}</label>
            <pv-input-number
                v-model="form.plannedQuantity"
                input-id="stop-quantity"
                :min="1"
                :invalid="Boolean(visibleErrors.plannedQuantity)"
                :aria-describedby="visibleErrors.plannedQuantity ? 'stop-quantity-error' : undefined"
                fluid/>
            <small v-if="visibleErrors.plannedQuantity" id="stop-quantity-error" class="form-field__error">{{ t(visibleErrors.plannedQuantity) }}</small>
        </div>
    </form-dialog>
</template>
