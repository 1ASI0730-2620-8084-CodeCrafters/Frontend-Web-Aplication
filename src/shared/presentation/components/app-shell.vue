<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import BrandLogo from './brand-logo.vue';
import LanguageSwitcher from './language-switcher.vue';
import SideNavigation from './side-navigation.vue';
import { NAVIGATION_ITEMS } from '../navigation-items.js';
import AuthenticationSection from '../../../iam/presentation/components/authentication-section.vue';
import useIamStore from '../../../iam/application/iam.store.js';

const { t } = useI18n();
const router = useRouter();
const iamStore = useIamStore();
const isDrawerVisible = ref(false);

const visibleItems = computed(() => NAVIGATION_ITEMS.filter(item => router.hasRoute(item.routeName) && iamStore.canAccess(item.roles)));
</script>

<template>
    <a class="skip-link" href="#main-content">{{ t('shell.skip') }}</a>
    <div class="app-shell">
        <aside class="app-shell__sidebar">
            <brand-logo inverse/>
            <side-navigation :items="visibleItems"/>
            <authentication-section/>
        </aside>
        <div class="app-shell__body">
            <header class="app-shell__topbar">
                <pv-button
                    class="app-shell__menu-button"
                    icon="pi pi-bars"
                    text
                    :aria-label="t('shell.open-navigation')"
                    :aria-expanded="isDrawerVisible"
                    @click="isDrawerVisible = true"/>
                <div class="app-shell__topbar-end">
                    <language-switcher/>
                </div>
            </header>
            <main id="main-content" class="app-shell__main" tabindex="-1">
                <router-view/>
            </main>
        </div>
    </div>
    <pv-drawer v-model:visible="isDrawerVisible" class="app-shell__drawer">
        <template #header>
            <brand-logo inverse/>
        </template>
        <side-navigation :items="visibleItems" @navigate="isDrawerVisible = false"/>
        <template #footer>
            <authentication-section/>
        </template>
    </pv-drawer>
</template>

<style>
.app-shell {
    display: grid;
    grid-template-columns: var(--sidebar-width) 1fr;
    min-height: 100vh;
}

.app-shell__sidebar {
    position: sticky;
    top: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    height: 100vh;
    padding: var(--space-5) var(--space-3);
    background: var(--chrome);
}

.app-shell__sidebar .side-navigation {
    flex: 1;
}

.app-shell__body {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.app-shell__topbar {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    height: var(--topbar-height);
    padding: 0 var(--space-6);
    border-bottom: 1px solid var(--line);
    background: var(--surface);
}

.app-shell__topbar-end {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    margin-left: auto;
}

.app-shell__menu-button.p-button {
    display: none;
}

.app-shell__main {
    flex: 1;
    outline: none;
}

.app-shell__drawer.p-drawer {
    background: var(--chrome);
    color: var(--primary-foreground);
    border: none;
}

@media (max-width: 48rem) {
    .app-shell {
        grid-template-columns: 1fr;
    }

    .app-shell__sidebar {
        display: none;
    }

    .app-shell__menu-button.p-button {
        display: inline-flex;
    }

    .app-shell__topbar {
        padding: 0 var(--space-4);
    }
}
</style>
