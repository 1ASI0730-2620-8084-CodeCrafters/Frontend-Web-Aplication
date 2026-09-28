<script setup>
import { useI18n } from 'vue-i18n';

const props = defineProps({
    formId: { type: String, required: true },
    header: { type: String, required: true },
    isSaving: { type: Boolean, default: false },
    submitLabel: { type: String, default: null }
});

const visible = defineModel('visible', { type: Boolean, default: false });
const emit = defineEmits(['submit']);
const { t } = useI18n();
</script>

<template>
    <pv-dialog v-model:visible="visible" modal :header="header" :style="{ width: '34rem' }" :breakpoints="{ '576px': '92vw' }">
        <form :id="props.formId" class="form-grid" novalidate @submit.prevent="emit('submit')">
            <slot></slot>
        </form>
        <template #footer>
            <pv-button :label="t('shared.form.cancel')" severity="secondary" text @click="visible = false"/>
            <pv-button type="submit" :form="props.formId" :label="submitLabel ?? t('shared.form.save')" :loading="isSaving"/>
        </template>
    </pv-dialog>
</template>
