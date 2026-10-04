<script setup>
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import useIamStore from '../../application/iam.store.js';

const { t } = useI18n();
const router = useRouter();
const store = useIamStore();

function performSignOut() {
    store.signOut();
    router.replace({ name: 'iam-sign-in' });
}
</script>

<template>
    <div v-if="store.currentUser" class="authentication-section">
        <div class="authentication-section__user">
            <pv-avatar :label="store.currentUser.initials" shape="circle" aria-hidden="true"/>
            <div class="authentication-section__identity">
                <span class="authentication-section__name">{{ store.currentUser.fullName }}</span>
                <span class="authentication-section__role">{{ t(`iam.roles.${store.currentUser.role}`) }}</span>
            </div>
        </div>
        <router-link :to="{ name: 'profile' }" class="authentication-section__action" active-class="authentication-section__action--active">
            <i class="pi pi-user" aria-hidden="true"></i>
            <span>{{ t('navigation.profile') }}</span>
        </router-link>
        <button type="button" class="authentication-section__action" @click="performSignOut">
            <i class="pi pi-sign-out" aria-hidden="true"></i>
            <span>{{ t('iam.sign-out') }}</span>
        </button>
    </div>
</template>

<style scoped>
.authentication-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding-top: var(--space-4);
    border-top: 1px solid color-mix(in srgb, var(--primary-foreground) 15%, transparent);
}

.authentication-section__user {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    min-width: 0;
}

.authentication-section__identity {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.authentication-section__name {
    overflow: hidden;
    color: var(--primary-foreground);
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
    text-overflow: ellipsis;
    white-space: nowrap;
}

.authentication-section__role {
    color: color-mix(in srgb, var(--primary-foreground) 65%, transparent);
    font-size: var(--text-xs);
}

.authentication-section__action {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-3);
    border: none;
    border-radius: var(--radius-md);
    background: transparent;
    color: color-mix(in srgb, var(--primary-foreground) 75%, transparent);
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    text-decoration: none;
    cursor: pointer;
}

.authentication-section__action:hover,
.authentication-section__action--active {
    background: color-mix(in srgb, var(--primary-foreground) 10%, transparent);
    color: var(--primary-foreground);
}
</style>
