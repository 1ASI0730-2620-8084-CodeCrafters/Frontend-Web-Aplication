<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { RECEPTION_PROBLEM_TYPES } from '../../domain/model/report-reception-problem.command.js';

const props = defineProps({
    deliveryOrder: { type: Object, default: null },
    isSubmitting: { type: Boolean, default: false }
});

const visible = defineModel('visible', { type: Boolean, default: false });
const emit = defineEmits(['submit']);
const { t } = useI18n();

const form = reactive({ type: null, affectedQuantity: null, description: '' });
const wasSubmitted = ref(false);

const typeOptions = computed(() => RECEPTION_PROBLEM_TYPES.map(type => ({ value: type, label: t(`operations.tracking.problem.types.${type}`) })));
const showTypeError = computed(() => wasSubmitted.value && !form.type);
const showQuantityError = computed(() => wasSubmitted.value && !(form.affectedQuantity > 0));

watch(visible, isVisible => {
    if (!isVisible) return;
    form.type = null;
    form.affectedQuantity = props.deliveryOrder?.shortage || null;
    form.description = '';
    wasSubmitted.value = false;
});

function submitReport() {
    wasSubmitted.value = true;
    if (showTypeError.value || showQuantityError.value) return;
    emit('submit', { ...form });
}
</script>

<template>
    <pv-dialog v-model:visible="visible" modal :header="t('operations.tracking.problem.title')" :style="{ width: '28rem' }" :breakpoints="{ '576px': '92vw' }">
        <form id="reception-problem-form" class="reception-problem" novalidate @submit.prevent="submitReport">
            <p v-if="deliveryOrder" class="reception-problem__context">
                {{ t('operations.tracking.operation', { code: deliveryOrder.operationCode }) }} &middot; {{ deliveryOrder.deliveryPointName }}
            </p>
            <div class="reception-problem__field">
                <label for="reception-problem-type">{{ t('operations.tracking.problem.type') }}</label>
                <pv-select
                    v-model="form.type"
                    input-id="reception-problem-type"
                    :options="typeOptions"
                    option-label="label"
                    option-value="value"
                    :placeholder="t('operations.tracking.problem.type-placeholder')"
                    :invalid="showTypeError"
                    :aria-describedby="showTypeError ? 'reception-problem-type-error' : undefined"
                    fluid/>
                <small v-if="showTypeError" id="reception-problem-type-error" class="reception-problem__error">{{ t('operations.tracking.problem.type-required') }}</small>
            </div>
            <div class="reception-problem__field">
                <label for="reception-problem-quantity">{{ t('operations.tracking.problem.quantity') }}</label>
                <pv-input-number
                    v-model="form.affectedQuantity"
                    input-id="reception-problem-quantity"
                    :min="1"
                    :max="deliveryOrder?.plannedQuantity"
                    :invalid="showQuantityError"
                    :aria-describedby="showQuantityError ? 'reception-problem-quantity-error' : undefined"
                    fluid/>
                <small v-if="showQuantityError" id="reception-problem-quantity-error" class="reception-problem__error">{{ t('operations.tracking.problem.quantity-required') }}</small>
            </div>
            <div class="reception-problem__field">
                <label for="reception-problem-description">{{ t('operations.tracking.problem.description') }}</label>
                <pv-textarea id="reception-problem-description" v-model="form.description" rows="3" maxlength="500" auto-resize fluid/>
            </div>
        </form>
        <template #footer>
            <pv-button :label="t('operations.tracking.problem.cancel')" severity="secondary" text @click="visible = false"/>
            <pv-button type="submit" form="reception-problem-form" :label="t('operations.tracking.problem.submit')" :loading="isSubmitting"/>
        </template>
    </pv-dialog>
</template>

<style scoped>
.reception-problem {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
}

.reception-problem__context {
    margin: 0;
    color: var(--ink-70);
    font-size: var(--text-sm);
}

.reception-problem__field {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.reception-problem__field label {
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
}

.reception-problem__error {
    color: var(--danger-strong);
}
</style>
