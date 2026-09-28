<script setup>
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const { t } = useI18n();
</script>

<template>
    <section class="page" aria-labelledby="not-found-title">
        <h1 id="not-found-title" class="page__title">{{ t('not-found.title') }}</h1>
        <p class="page__lead">{{ t('not-found.content', { path: route.path }) }}</p>
        <div>
            <pv-button as-child v-slot="slotProps">
                <router-link :to="{ name: 'home' }" :class="slotProps.class">{{ t('not-found.go-home') }}</router-link>
            </pv-button>
        </div>
    </section>
</template>
