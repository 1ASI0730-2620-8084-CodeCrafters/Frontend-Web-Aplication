<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppShell from './shared/presentation/components/app-shell.vue';

const route = useRoute();
const usesShell = computed(() => !route.meta.public);
</script>

<template>
    <pv-toast/>
    <pv-confirm-dialog/>
    <app-shell v-if="usesShell"/>
    <router-view v-else/>
</template>
