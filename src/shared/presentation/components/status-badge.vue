<script setup>
defineProps({
    label: { type: String, required: true },
    tone: {
        type: String,
        default: 'neutral',
        validator: value => ['neutral', 'info', 'success', 'warning', 'danger', 'brand'].includes(value)
    }
});
</script>

<template>
    <span class="status-badge" :class="`status-badge--${tone}`">{{ label }}</span>
</template>

<style scoped>
.status-badge {
    display: inline-flex;
    align-items: center;
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-full);
    font-size: var(--text-xs);
    font-weight: var(--weight-semibold);
    line-height: var(--leading-tight);
    white-space: nowrap;
}

.status-badge--neutral {
    background: var(--fill-10);
    color: var(--foreground);
}

.status-badge--info {
    background: var(--info-soft);
    color: var(--info-strong);
}

.status-badge--success {
    background: var(--success-soft);
    color: var(--success-strong);
}

.status-badge--warning {
    background: var(--warning-soft);
    color: var(--warning-strong);
}

.status-badge--danger {
    background: var(--danger-soft);
    color: var(--danger-strong);
}

.status-badge--brand {
    background: var(--primary-soft);
    color: var(--primary-dark);
}
</style>
