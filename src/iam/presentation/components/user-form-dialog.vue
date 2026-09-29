<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { USER_ROLES } from '../../domain/model/user-role.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MINIMUM_PASSWORD_LENGTH = 8;
const TEXT_FIELDS = [
    { name: 'firstName', label: 'iam.user-form.first-name', type: 'text', autocomplete: 'given-name' },
    { name: 'lastName', label: 'iam.user-form.last-name', type: 'text', autocomplete: 'family-name' },
    { name: 'email', label: 'iam.user-form.email', type: 'email', autocomplete: 'email' }
];

const props = defineProps({
    user: { type: Object, default: null },
    isSaving: { type: Boolean, default: false },
    serverError: { type: String, default: null }
});

const visible = defineModel('visible', { type: Boolean, default: false });
const emit = defineEmits(['submit']);
const { t } = useI18n();

const form = reactive({ firstName: '', lastName: '', email: '', role: USER_ROLES.FLEET_SUPERVISOR, password: '' });
const wasSubmitted = ref(false);
const submittedEmail = ref('');

const isEditing = computed(() => props.user !== null);
const roleOptions = computed(() => Object.values(USER_ROLES).map(role => ({ value: role, label: t(`iam.roles.${role}`) })));
const errors = computed(() => {
    const fieldErrors = {};
    if (!form.firstName.trim()) fieldErrors.firstName = 'iam.user-form.required';
    if (!form.lastName.trim()) fieldErrors.lastName = 'iam.user-form.required';
    if (!form.email.trim()) fieldErrors.email = 'iam.user-form.required';
    else if (!EMAIL_PATTERN.test(form.email.trim())) fieldErrors.email = 'iam.user-form.email-invalid';
    else if (props.serverError === 'email-taken' && form.email.trim().toLowerCase() === submittedEmail.value) fieldErrors.email = 'iam.user-form.email-taken';
    if (!isEditing.value && form.password.length < MINIMUM_PASSWORD_LENGTH) fieldErrors.password = 'iam.user-form.password-short';
    return fieldErrors;
});
const visibleErrors = computed(() => (wasSubmitted.value ? errors.value : {}));

watch(visible, isVisible => {
    if (!isVisible) return;
    form.firstName = props.user?.firstName ?? '';
    form.lastName = props.user?.lastName ?? '';
    form.email = props.user?.email ?? '';
    form.role = props.user?.role ?? USER_ROLES.FLEET_SUPERVISOR;
    form.password = '';
    wasSubmitted.value = false;
});

function submitForm() {
    wasSubmitted.value = true;
    submittedEmail.value = '';
    if (Object.keys(errors.value).length > 0) return;
    submittedEmail.value = form.email.trim().toLowerCase();
    emit('submit', { ...form });
}
</script>

<template>
    <pv-dialog
        v-model:visible="visible"
        modal
        :header="t(isEditing ? 'iam.user-form.edit-title' : 'iam.user-form.new-title')"
        :style="{ width: '32rem' }"
        :breakpoints="{ '576px': '92vw' }">
        <form id="user-form" class="form-grid" novalidate @submit.prevent="submitForm">
            <div v-for="field in TEXT_FIELDS" :key="field.name" class="form-field">
                <label class="form-field__label" :for="`user-form-${field.name}`">{{ t(field.label) }}</label>
                <pv-input-text
                    :id="`user-form-${field.name}`"
                    v-model="form[field.name]"
                    :type="field.type"
                    :autocomplete="field.autocomplete"
                    :invalid="Boolean(visibleErrors[field.name])"
                    :aria-describedby="visibleErrors[field.name] ? `user-form-${field.name}-error` : undefined"
                    fluid/>
                <small v-if="visibleErrors[field.name]" :id="`user-form-${field.name}-error`" class="form-field__error">{{ t(visibleErrors[field.name]) }}</small>
            </div>
            <template v-if="!isEditing">
                <div class="form-field">
                    <label class="form-field__label" for="user-form-role">{{ t('iam.user-form.role') }}</label>
                    <pv-select v-model="form.role" input-id="user-form-role" :options="roleOptions" option-label="label" option-value="value" fluid/>
                </div>
                <div class="form-field">
                    <label class="form-field__label" for="user-form-password">{{ t('iam.user-form.password') }}</label>
                    <pv-password
                        v-model="form.password"
                        input-id="user-form-password"
                        :feedback="false"
                        :invalid="Boolean(visibleErrors.password)"
                        :input-props="{ autocomplete: 'new-password', 'aria-describedby': 'user-form-password-hint' }"
                        toggle-mask
                        fluid/>
                    <small v-if="visibleErrors.password" class="form-field__error">{{ t(visibleErrors.password) }}</small>
                    <small id="user-form-password-hint" class="user-form__hint">{{ t('iam.user-form.password-hint') }}</small>
                </div>
            </template>
        </form>
        <template #footer>
            <pv-button :label="t('iam.user-form.cancel')" severity="secondary" text @click="visible = false"/>
            <pv-button type="submit" form="user-form" :label="t('iam.user-form.save')" :loading="isSaving"/>
        </template>
    </pv-dialog>
</template>

<style scoped>
.user-form__hint {
    color: var(--ink-60);
}
</style>
