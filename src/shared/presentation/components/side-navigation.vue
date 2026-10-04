<script setup>
import { useI18n } from 'vue-i18n';

defineProps({
    items: { type: Array, required: true }
});

const emit = defineEmits(['navigate']);
const { t } = useI18n();
</script>

<template>
    <nav class="side-navigation" :aria-label="t('shell.primary-navigation')">
        <ul class="side-navigation__list">
            <li v-for="item in items" :key="item.routeName">
                <router-link
                    class="side-navigation__link"
                    active-class="side-navigation__link--active"
                    :to="{ name: item.routeName }"
                    @click="emit('navigate')">
                    <i :class="item.icon" aria-hidden="true"></i>
                    <span>{{ t(item.label) }}</span>
                </router-link>
            </li>
        </ul>
    </nav>
</template>

<style scoped>
.side-navigation__list {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    margin: 0;
    padding: 0;
    list-style: none;
}

.side-navigation__link {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    color: color-mix(in srgb, var(--primary-foreground) 75%, transparent);
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    text-decoration: none;
    transition: background var(--transition), color var(--transition);
}

.side-navigation__link:hover,
.side-navigation__link--active {
    background: color-mix(in srgb, var(--primary-foreground) 10%, transparent);
    color: var(--primary-foreground);
}
</style>
