<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import FormDialog from '../../../shared/presentation/components/form-dialog.vue';

defineProps({
    incident: { type: Object, default: null },
    evidences: { type: Array, required: true },
    evidencesLoaded: { type: Boolean, default: false },
    isSaving: { type: Boolean, default: false }
});

const visible = defineModel('visible', { type: Boolean, default: false });
const emit = defineEmits(['submit']);
const { t } = useI18n();

const fileUrl = ref('');
const wasSubmitted = ref(false);

const hasUrlError = computed(() => wasSubmitted.value && !isValidUrl(fileUrl.value));

watch(visible, isVisible => {
    if (!isVisible) return;
    fileUrl.value = '';
    wasSubmitted.value = false;
});

function isValidUrl(value) {
    try {
        const url = new URL(value.trim());
        return ['http:', 'https:'].includes(url.protocol);
    } catch {
        return false;
    }
}

function submitEvidence() {
    wasSubmitted.value = true;
    if (!isValidUrl(fileUrl.value)) return;
    emit('submit', fileUrl.value.trim());
}
</script>

<template>
    <form-dialog
            v-model:visible="visible"
            form-id="attach-evidence-form"
            :header="t('incidents.evidence.title', { code: incident?.code ?? '' })"
            :submit-label="t('incidents.evidence.submit')"
            :is-saving="isSaving"
            @submit="submitEvidence">
        <div class="form-field attach-evidence__wide">
            <label class="form-field__label" for="incident-evidence-url">{{ t('incidents.evidence.url') }}</label>
            <pv-input-text
                    id="incident-evidence-url"
                    v-model="fileUrl"
                    type="url"
                    maxlength="1000"
                    :placeholder="t('incidents.evidence.url-placeholder')"
                    :invalid="hasUrlError"
                    :aria-describedby="hasUrlError ? 'incident-evidence-url-error' : undefined"
                    fluid/>
            <small v-if="hasUrlError" id="incident-evidence-url-error" class="form-field__error">{{ t('incidents.evidence.url-invalid') }}</small>
        </div>
        <div class="attach-evidence__list attach-evidence__wide" aria-live="polite">
            <span class="form-field__label">{{ t('incidents.evidence.existing') }}</span>
            <pv-message v-if="!evidencesLoaded" severity="secondary">{{ t('incidents.evidence.loading') }}</pv-message>
            <pv-message v-else-if="evidences.length === 0" severity="secondary">{{ t('incidents.evidence.empty') }}</pv-message>
            <ul v-else class="attach-evidence__items">
                <li v-for="evidence in evidences" :key="evidence.id">
                    <a :href="evidence.fileUrl" target="_blank" rel="noopener noreferrer">{{ t('incidents.evidence.open') }}</a>
                </li>
            </ul>
        </div>
    </form-dialog>
</template>

<style scoped>
.attach-evidence__wide {
    grid-column: 1 / -1;
}

.attach-evidence__list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.attach-evidence__items {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin: 0;
    padding-left: var(--space-5);
}

.attach-evidence__items a {
    color: var(--primary-mid);
    font-weight: var(--weight-semibold);
}
</style>
