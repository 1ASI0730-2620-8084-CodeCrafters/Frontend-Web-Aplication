<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import useIamStore from '../../application/iam.store.js';
import { UpdateOrganizationCommand } from '../../domain/model/user-commands.js';

const { t } = useI18n();
const toast = useToast();
const store = useIamStore();

const form = reactive({ businessName: '', phone: '', address: '' });
const wasSubmitted = ref(false);
const loadFailed = ref(false);

const showBusinessNameError = computed(() => wasSubmitted.value && !form.businessName.trim());

function fillForm() {
    form.businessName = store.organization.businessName;
    form.phone = store.organization.phone;
    form.address = store.organization.address;
}

async function saveCompany() {
    wasSubmitted.value = true;
    if (showBusinessNameError.value) return;
    const error = await store.updateOrganization(new UpdateOrganizationCommand({ organizationId: store.organization.id, ...form }));
    toast.add({
        severity: error ? 'error' : 'success',
        summary: t(error ? 'iam.company.failure' : 'iam.company.success'),
        life: 4000
    });
}

onMounted(async () => {
    try {
        await store.fetchOrganization();
        fillForm();
    } catch {
        loadFailed.value = true;
    }
});
</script>

<template>
    <section class="page" aria-labelledby="company-title">
        <div>
            <h1 id="company-title" class="page__title">{{ t('iam.company.title') }}</h1>
            <p class="page__lead">{{ t('iam.company.lead') }}</p>
        </div>
        <pv-message v-if="loadFailed" severity="error" role="alert">{{ t('iam.company.load-error') }}</pv-message>
        <form v-else-if="store.organization" class="panel company" novalidate @submit.prevent="saveCompany">
            <div class="form-grid">
                <div class="form-field">
                    <label class="form-field__label" for="company-business-name">{{ t('iam.company.business-name') }}</label>
                    <pv-input-text
                        id="company-business-name"
                        v-model="form.businessName"
                        :invalid="showBusinessNameError"
                        :aria-describedby="showBusinessNameError ? 'company-business-name-error' : undefined"
                        fluid/>
                    <small v-if="showBusinessNameError" id="company-business-name-error" class="form-field__error">{{ t('iam.company.business-name-required') }}</small>
                </div>
                <div class="form-field">
                    <label class="form-field__label" for="company-tax-id">{{ t('iam.company.tax-id') }}</label>
                    <pv-input-text id="company-tax-id" :model-value="store.organization.taxId" readonly fluid/>
                </div>
                <div class="form-field">
                    <label class="form-field__label" for="company-email">{{ t('iam.company.email') }}</label>
                    <pv-input-text id="company-email" :model-value="store.organization.email" readonly fluid/>
                </div>
                <div class="form-field">
                    <label class="form-field__label" for="company-phone">{{ t('iam.company.phone') }}</label>
                    <pv-input-text id="company-phone" v-model="form.phone" type="tel" autocomplete="tel" fluid/>
                </div>
                <div class="form-field company__wide">
                    <label class="form-field__label" for="company-address">{{ t('iam.company.address') }}</label>
                    <pv-input-text id="company-address" v-model="form.address" autocomplete="street-address" fluid/>
                </div>
            </div>
            <div class="form-actions">
                <pv-button type="submit" :label="t('iam.company.save')" icon="pi pi-save" :loading="store.isSaving"/>
            </div>
        </form>
    </section>
</template>

<style scoped>
.company {
    max-width: 48rem;
}

.company__wide {
    grid-column: 1 / -1;
}
</style>
