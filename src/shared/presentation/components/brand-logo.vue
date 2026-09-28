<script setup>
import { useI18n } from 'vue-i18n';

defineProps({
    inverse: { type: Boolean, default: false }
});

const { t } = useI18n();
</script>

<template>
    <span class="brand-logo" :class="{ 'brand-logo--inverse': inverse }">
        <span class="brand-logo__mark" aria-hidden="true">
            <i class="pi pi-truck"></i>
        </span>
        <span class="brand-logo__name">{{ t('app.name') }}</span>
    </span>
</template>

<style scoped>
.brand-logo {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--primary-dark);
    font-size: var(--text-lg);
    font-weight: var(--weight-bold);
}

.brand-logo--inverse {
    color: var(--primary-foreground);
}

.brand-logo__mark {
    display: inline-grid;
    place-items: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: var(--radius-md);
    background: var(--primary);
    color: var(--primary-foreground);
    font-size: var(--text-sm);
}
</style>
