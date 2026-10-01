<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import FormDialog from '../../../shared/presentation/components/form-dialog.vue';

const props = defineProps({
    incident: { type: Object, default: null },
    isSaving: { type: Boolean, default: false }
});

const visible = defineModel('visible', { type: Boolean, default: false });
const emit = defineEmits(['submit']);
const { t } = useI18n();

const resolution = ref('');
const wasSubmitted = ref(false);

const showResolutionError = computed(() => wasSubmitted.value && props.incident?.requiresResolution && !resolution.value.trim());

watch(visible, isVisible => {
    if (!isVisible) return;
    resolution.value = '';
    wasSubmitted.value = false;
});

function submitTransition() {
    wasSubmitted.value = true;
    if (!showResolutionError.value) emit('submit', resolution.value);
}
</script>

<template>
    <form-dialog
        v-model:visible="visible"
        form-id="advance-incident-form"
        :header="t('incidents.advance.title', { code: incident?.code ?? '' })"
        :submit-label="incident?.nextStatus ? t(`incidents.advance.to.${incident.nextStatus}`) : undefined"
        :is-saving="isSaving"
        @submit="submitTransition">
        <p v-if="incident" class="advance-incident__summary">{{ incident.description }}</p>
        <div v-if="incident?.requiresResolution" class="form-field advance-incident__wide">
            <label class="form-field__label" for="incident-resolution">{{ t('incidents.advance.resolution') }}</label>
            <pv-textarea
                id="incident-resolution"
                v-model="resolution"
                rows="3"
                maxlength="500"
                auto-resize
                :invalid="showResolutionError"
                :aria-describedby="showResolutionError ? 'incident-resolution-error' : undefined"
                fluid/>
            <small v-if="showResolutionError" id="incident-resolution-error" class="form-field__error">{{ t('incidents.advance.resolution-required') }}</small>
        </div>
    </form-dialog>
</template>

<style scoped>
.advance-incident__summary {
    grid-column: 1 / -1;
    margin: 0;
    color: var(--ink-70);
}

.advance-incident__wide {
    grid-column: 1 / -1;
}
</style>
