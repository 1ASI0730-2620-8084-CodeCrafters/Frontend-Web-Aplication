<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import useIamStore from '../../application/iam.store.js';

const { t } = useI18n();
const router = useRouter();
const store = useIamStore();

const profileFields = computed(() => {
    const user = store.currentUser;
    if (!user) return [];
    return [
        { label: 'iam.profile.first-name', value: user.firstName },
        { label: 'iam.profile.last-name', value: user.lastName },
        { label: 'iam.profile.email', value: user.email },
        { label: 'iam.profile.role', value: t(`iam.roles.${user.role}`) },
        { label: 'iam.profile.company', value: store.organization?.businessName ?? '' }
    ];
});

function performSignOut() {
    store.signOut();
    router.replace({ name: 'iam-sign-in' });
}

onMounted(() => {
    if (!store.organization) store.fetchOrganization().catch(() => null);
});
</script>

<template>
    <section class="page" aria-labelledby="profile-title">
        <h1 id="profile-title" class="page__title">{{ t('iam.profile.title') }}</h1>
        <div v-if="store.currentUser" class="panel profile">
            <div class="profile__header">
                <pv-avatar :label="store.currentUser.initials" shape="circle" size="xlarge" aria-hidden="true"/>
                <div>
                    <h2 class="profile__name">{{ store.currentUser.fullName }}</h2>
                    <span class="profile__role">{{ t(`iam.roles.${store.currentUser.role}`) }}</span>
                </div>
            </div>
            <dl class="profile__fields">
                <div v-for="field in profileFields" :key="field.label" class="profile__field">
                    <dt>{{ t(field.label) }}</dt>
                    <dd>{{ field.value }}</dd>
                </div>
            </dl>
            <div class="form-actions">
                <pv-button :label="t('iam.sign-out')" icon="pi pi-sign-out" @click="performSignOut"/>
            </div>
        </div>
    </section>
</template>

<style scoped>
.profile {
    max-width: 40rem;
}

.profile__header {
    display: flex;
    align-items: center;
    gap: var(--space-4);
}

.profile__name {
    font-size: var(--text-xl);
}

.profile__role {
    display: inline-block;
    margin-top: var(--space-1);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-full);
    background: var(--primary-soft);
    color: var(--primary-dark);
    font-size: var(--text-xs);
    font-weight: var(--weight-semibold);
}

.profile__fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
    gap: var(--space-4) var(--space-6);
    margin: 0;
}

.profile__field {
    padding-bottom: var(--space-2);
    border-bottom: 1px solid var(--line);
}

.profile__field dt {
    color: var(--ink-60);
    font-size: var(--text-xs);
    font-weight: var(--weight-semibold);
    text-transform: uppercase;
}

.profile__field dd {
    margin: var(--space-1) 0 0;
    overflow-wrap: anywhere;
}
</style>
